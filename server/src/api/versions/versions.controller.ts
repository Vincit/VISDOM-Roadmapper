import { RouteHandlerFnc } from 'src/types/customTypes';
import Version from './versions.model';

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
  const inserted = await Version.transaction(async (trx) => {
    const maxVersion = (await Version.query(trx)
      .where({ roadmapId: Number(ctx.params.roadmapId) })
      .max('sortingRank')
      .first()) as any;
    const maxRank = maxVersion.max === null ? -1 : maxVersion.max; // Treat null as -1 so next insertion goes to 0

    if (
      ctx.request.body.sortingRank === null ||
      ctx.request.body.sortingRank === undefined ||
      ctx.request.body.sortingRank > maxRank + 1
    ) {
      ctx.request.body.sortingRank = maxRank + 1;
    } else {
      await Version.query(trx)
        .where({ roadmapId: Number(ctx.params.roadmapId) })
        .andWhere('sortingRank', '>=', ctx.request.body.sortingRank)
        .increment('sortingRank', 1);
    }

    return await Version.query().insertAndFetch({
      name: ctx.request.body.name,
      tasks: ctx.request.body.name,
      sortingRank: ctx.request.body.sortingRank,
      roadmapId: Number(ctx.params.roadmapId),
    });
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
    if (delVersion && numDeleted == 1) {
      await Version.query(trx)
        .where({ roadmapId: delVersion.roadmapId })
        .andWhere('sortingRank', '>', delVersion.sortingRank)
        .decrement('sortingRank', 1);
    }
    return numDeleted;
  });
  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchVersions: RouteHandlerFnc = async (ctx) => {
  let { sortingRank } = ctx.request.body;
  delete ctx.request.body.sortingRank;
  const { id, name, tasks, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await Version.transaction(async (trx) => {
    const versionId = Number(ctx.params.versionId);
    const originalVersion = await Version.query(trx)
      .findById(versionId)
      .where({ roadmapId: Number(ctx.params.roadmapId) });
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
      await trx('versionTasks').where('versionId', versionId).delete();
      if (tasks?.length) {
        await trx('versionTasks').insert(
          tasks.map((taskId: number, order: number) => ({
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
    return void (ctx.body = updated);
  }
};
