import { ClientEvents } from './../../../../shared/types/sockettypes';
import { Permission } from './../../../../shared/types/customTypes';
import { emitRoadmapEvent } from './../../utils/socketIoUtils';
import { Knex } from 'knex';
import { RouteHandlerFnc } from '../../types/customTypes';
import Task from '../tasks/tasks.model';
import { TaskRelation } from './taskrelation.model';
import { isNumberArray, isNumber } from '../../utils/typeValidation';
import { TaskRelationType } from '../../../../shared/types/customTypes';

// Maps the task ids so that task in the same synergy group have the same id
const canonicalIds = (
  relations: { from: number; to: number; type: TaskRelationType }[],
) => {
  const ids = new Map<number, number>();
  let nextId = 0;
  relations
    .filter(({ type }) => type === TaskRelationType.Synergy)
    .forEach(({ from, to }) => {
      const a = ids.get(from);
      const b = ids.get(to);
      if (a !== undefined && b !== undefined && a !== b)
        throw new Error('task in multiple synergies');
      const s = a ?? b;
      if (s !== undefined) {
        ids.set(from, s);
        ids.set(to, s);
      } else {
        ids.set(from, nextId);
        ids.set(to, nextId);
        nextId++;
      }
    });
  relations
    .flatMap(({ from, to, type }) =>
      type === TaskRelationType.Dependency ? [from, to] : [],
    )
    .forEach((id) => {
      if (!ids.has(id)) {
        ids.set(id, nextId);
        nextId++;
      }
    });
  return ids;
};

const validateRelations = (
  relations: { from: number; to: number; type: TaskRelationType }[],
) => {
  const ids = canonicalIds(relations);
  const deps = new Map<number, Set<number>>();
  relations
    .filter(({ type }) => type === TaskRelationType.Dependency)
    .forEach(({ from, to }) => {
      const a = ids.get(from)!;
      const b = ids.get(to)!;
      if (a === b) throw new Error('dependency inside synergy group');
      const prev = deps.get(a) ?? new Set();
      prev.add(b);
      deps.set(a, prev);
    });

  const done = new Set<number>();
  const checkCycles = (from: number, visiting: Set<number> = new Set()) => {
    if (visiting.has(from)) throw new Error('dependency cycle');
    visiting.add(from);
    deps.get(from)?.forEach((to) => {
      if (!done.has(to)) checkCycles(to, visiting);
    });
    visiting.delete(from);
    done.add(from);
  };

  deps.forEach((_, start) => checkCycles(start));
};

const relations = async (roadmapId: number, trx?: Knex.Transaction) => {
  const tasks = (await Task.query(trx).where({ roadmapId })).map((t) => t.id);
  return await TaskRelation.query(trx)
    .whereIn('from', tasks)
    .orWhereIn('to', tasks);
};

export const getRelations: RouteHandlerFnc = async (ctx) => {
  ctx.body = await relations(Number(ctx.params.roadmapId));
};

const tasksInRoadmap = async (roadmapId: number, taskIds: number[]) => {
  const tasks = await Task.query().where({ roadmapId }).whereIn('id', taskIds);
  return tasks.length === taskIds.length;
};

export const addRelation: RouteHandlerFnc = async (ctx) => {
  const { from, to, type } = ctx.request.body;
  const roadmapId = Number(ctx.params.roadmapId);
  if (from !== to && (await tasksInRoadmap(roadmapId, [from, to]))) {
    try {
      await TaskRelation.transaction(async (trx) => {
        await TaskRelation.query(trx).insert({ from, to, type });
        const res = await relations(roadmapId, trx);
        validateRelations(res);

        await emitRoadmapEvent(ctx.io, {
          roadmapId: Number(ctx.params.roadmapId),
          dontEmitToUserIds: [ctx.state.user!.id],
          requirePermission: Permission.TaskRead,
          event: ClientEvents.TASKRELATION_UPDATED,
          eventParams: [],
        });

        ctx.body = res;
      });
    } catch (err: any) {
      ctx.body = { error: err.message };
      ctx.status = 409;
    }
  } else {
    ctx.status = 400;
  }
};

export const addSynergies: RouteHandlerFnc = async (ctx) => {
  const { from, to } = ctx.request.body;
  const roadmapId = Number(ctx.params.roadmapId);
  if (
    !isNumber(from) ||
    !isNumberArray(to) ||
    to.includes(from) ||
    !(await tasksInRoadmap(roadmapId, [from, ...to]))
  ) {
    ctx.status = 400;
    return;
  }
  try {
    await TaskRelation.transaction(async (trx) => {
      // delete previous synergies associated with 'from' task
      await TaskRelation.query(trx)
        .where({ type: TaskRelationType.Synergy })
        .andWhere((q) => q.where({ from }).orWhere({ to: from }))
        .delete();
      const synergies = to.flatMap((to) => [
        { from, to, type: TaskRelationType.Synergy },
        { from: to, to: from, type: TaskRelationType.Synergy },
      ]);
      if (!synergies.length) {
        ctx.body = await relations(roadmapId, trx);
        await emitRoadmapEvent(ctx.io, {
          roadmapId: Number(ctx.params.roadmapId),
          dontEmitToUserIds: [ctx.state.user!.id],
          requirePermission: Permission.TaskRead,
          event: ClientEvents.TASKRELATION_UPDATED,
          eventParams: [],
        });
        return;
      }
      await TaskRelation.query(trx).insert(synergies);
      const res = await relations(roadmapId, trx);
      validateRelations(res);
      await emitRoadmapEvent(ctx.io, {
        roadmapId: Number(ctx.params.roadmapId),
        dontEmitToUserIds: [ctx.state.user!.id],
        requirePermission: Permission.TaskRead,
        event: ClientEvents.TASKRELATION_UPDATED,
        eventParams: [],
      });
      ctx.body = res;
    });
  } catch (err: any) {
    ctx.body = { error: err.message };
    ctx.status = 409;
  }
};

export const deleteRelation: RouteHandlerFnc = async (ctx) => {
  const { from, to, type } = ctx.request.body;
  const deleted =
    (await tasksInRoadmap(Number(ctx.params.roadmapId), [from, to])) &&
    (await TaskRelation.query().where({ from, to, type }).delete());

  if (deleted === 1) {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.TaskRead,
      event: ClientEvents.TASKRELATION_UPDATED,
      eventParams: [],
    });
  }
  ctx.status = deleted === 1 ? 200 : 404;
};
