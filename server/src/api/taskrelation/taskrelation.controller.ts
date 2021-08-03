import { RouteHandlerFnc } from '../../types/customTypes';
import Task from '../tasks/tasks.model';
import { TaskRelation } from './taskrelation.model';

export const getRelations: RouteHandlerFnc = async (ctx) => {
  const tasks = (
    await Task.query().where({
      roadmapId: Number(ctx.params.roadmapId),
    })
  ).map((t) => t.id);

  ctx.body = await TaskRelation.query()
    .whereIn('from', tasks)
    .orWhereIn('to', tasks);
};

const tasksInRoadmap = async (roadmapId: number, taskIds: number[]) => {
  const tasks = await Task.query().where({ roadmapId }).whereIn('id', taskIds);
  return tasks.length === taskIds.length;
};

export const addRelation: RouteHandlerFnc = async (ctx) => {
  const { from, to, type } = ctx.request.body;
  if (
    from !== to &&
    (await tasksInRoadmap(Number(ctx.params.roadmapId), [from, to]))
  ) {
    ctx.body = await TaskRelation.query().insertAndFetch({ from, to, type });
  } else {
    ctx.status = 400;
  }
};

export const deleteRelation: RouteHandlerFnc = async (ctx) => {
  const { from, to, type } = ctx.request.body;
  const deleted =
    (await tasksInRoadmap(Number(ctx.params.roadmapId), [from, to])) &&
    (await TaskRelation.query().where({ from, to, type }).delete());
  ctx.status = deleted === 1 ? 200 : 404;
};
