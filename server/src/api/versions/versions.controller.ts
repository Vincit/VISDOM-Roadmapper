import { Permission, TaskStatus } from './../../../../shared/types/customTypes';
import { RouteHandlerFnc } from '../../types/customTypes';
import Version from './versions.model';
import { ClientEvents } from './../../../../shared/types/sockettypes';
import { emitRoadmapEvent } from './../../utils/socketIoUtils';
import { isOptional, isNumberArray } from '../../utils/typeValidation';
import Task from '../tasks/tasks.model';

export const getVersions: RouteHandlerFnc = async (ctx) => {
  const query = Version.query()
    .where({ roadmapId: Number(ctx.params.roadmapId) })
    .orderBy('sortingRank', 'asc');

  if (ctx.query) {
    query.where(ctx.query);
  }
  query.withGraphFetched('tasks(ordered).[ratings, createdBy]').modifiers({
    ordered(builder) {
      builder.orderBy('order', 'asc');
    },
  });
  ctx.body = await query;
};

export const postVersions: RouteHandlerFnc = async (ctx) => {
  let { sortingRank, name, tasks, roadmapId: _, ...others } = ctx.request.body;
  if (Object.keys(others).length || !isOptional(isNumberArray)(tasks)) {
    ctx.status = 400;
    return;
  }

  const roadmapId = Number(ctx.params.roadmapId);
  const inserted = await Version.transaction(async (trx) => {
    const maxVersion = (await Version.query(trx)
      .where({ roadmapId })
      .max('sortingRank')
      .first()) as any;
    const maxRank = maxVersion.max === null ? -1 : maxVersion.max; // Treat null as -1 so next insertion goes to 0

    if (
      sortingRank === null ||
      sortingRank === undefined ||
      sortingRank > maxRank + 1
    ) {
      sortingRank = maxRank + 1;
    } else {
      await Version.query(trx)
        .where({ roadmapId })
        .andWhere('sortingRank', '>=', sortingRank)
        .increment('sortingRank', 1);
    }

    return await Version.query().insertAndFetch({
      name,
      tasks,
      sortingRank,
      roadmapId,
    });
  });

  await emitRoadmapEvent(ctx.io, {
    roadmapId,
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.VersionRead,
    event: ClientEvents.VERSION_UPDATED,
    eventParams: [],
  });

  ctx.body = inserted;
};

export const deleteVersions: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Version.transaction(async (trx) => {
    const delVersion = await Version.query(trx)
      .findById(Number(ctx.params.versionId))
      .where({ roadmapId: Number(ctx.params.roadmapId) });
    const numDeleted = await Version.query(trx)
      .findById(Number(ctx.params.versionId))
      .delete();
    if (delVersion && numDeleted === 1) {
      await Version.query(trx)
        .where({ roadmapId: delVersion.roadmapId })
        .andWhere('sortingRank', '>', delVersion.sortingRank)
        .decrement('sortingRank', 1);
    }
    return numDeleted;
  });

  if (numDeleted === 1) {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.VersionRead,
      event: ClientEvents.VERSION_UPDATED,
      eventParams: [],
    });
  }
  ctx.status = numDeleted === 1 ? 200 : 404;
};

export const completeVersions: RouteHandlerFnc = async (ctx) => {
  const roadmapId = Number(ctx.params.roadmapId);
  const version = await Version.query()
    .withGraphFetched('tasks')
    .findById(Number(ctx.params.versionId))
    .where({ roadmapId });
  if (!version) {
    ctx.status = 404;
    return;
  }

  const completedTasks = await Task.transaction((trx) =>
    Promise.all(
      version.tasks.map((task) =>
        task.$query(trx).patchAndFetch({ status: TaskStatus.COMPLETED }),
      ),
    ),
  );

  await emitRoadmapEvent(ctx.io, {
    roadmapId,
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.VersionRead,
    event: ClientEvents.VERSION_UPDATED,
    eventParams: [],
  });

  ctx.body = completedTasks;
};

export const patchVersions: RouteHandlerFnc = async (ctx) => {
  let { sortingRank } = ctx.request.body;
  delete ctx.request.body.sortingRank;
  const { id, name, tasks, ...others } = ctx.request.body;
  if (Object.keys(others).length || !isOptional(isNumberArray)(tasks)) {
    ctx.status = 400;
    return;
  }

  const updated = await Version.transaction(async (trx) => {
    const versionId = Number(ctx.params.versionId);
    const originalVersion = await Version.query(trx)
      .findById(versionId)
      .where({ roadmapId: Number(ctx.params.roadmapId) });

    if (!originalVersion) return null;

    const roadmapId = originalVersion.roadmapId;
    const previousRank = originalVersion.sortingRank;

    if (
      sortingRank !== undefined &&
      sortingRank !== null &&
      sortingRank !== previousRank
    ) {
      await Version.query(trx)
        .where({ roadmapId: roadmapId })
        .andWhere('sortingRank', '>', previousRank)
        .decrement('sortingRank', 1);

      const maxVersion = (await Version.query(trx)
        .where({ roadmapId: roadmapId })
        .max('sortingRank')
        .first()) as any;
      const maxRank = maxVersion.max === null ? -1 : maxVersion.max; // Treat null as -1 so next insertion goes to 0
      if (sortingRank > maxRank + 1) {
        sortingRank = maxRank + 1;
      }
      await Version.query(trx)
        .where({ roadmapId: roadmapId })
        .andWhere('sortingRank', '>=', sortingRank)
        .increment('sortingRank', 1);
    }

    // TODO: separate adding/deleting from updating
    if (tasks) {
      // Delete tasks from all versions
      await trx('versionTasks').whereIn('versionTasks.taskId', tasks).delete();

      // Wipe current versions tasks list and reconstruct it
      await trx('versionTasks').where('versionId', versionId).delete();
      if (tasks.length) {
        await trx('versionTasks').insert(
          tasks.map((taskId, order) => ({
            taskId,
            versionId,
            order,
          })),
        );
      }
    }

    const patched = await Version.query(trx).patchAndFetchById(
      Number(ctx.params.versionId),
      { name: name, sortingRank: sortingRank },
    );

    return patched || tasks;
  });

  if (!updated) {
    return void (ctx.status = 404);
  } else {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.VersionRead,
      event: ClientEvents.VERSION_UPDATED,
      eventParams: [],
    });
    return void (ctx.body = updated);
  }
};
