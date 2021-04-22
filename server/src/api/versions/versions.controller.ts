import { RouteHandlerFnc } from 'src/types/customTypes';
import Version from './versions.model';

export const getVersions: RouteHandlerFnc = async (ctx, _) => {
  const query = Version.query().orderBy('sortingRank', 'asc');
  if (ctx.query) {
    query.where(ctx.query);
  }
  query
    .withGraphFetched('tasks(ordered).[ratings, relatedTasks, createdBy]')
    .modifiers({
      ordered(builder) {
        builder.orderBy('order', 'asc');
      },
    });
  ctx.body = await query;
};

export const postVersions: RouteHandlerFnc = async (ctx, _) => {
  const inserted = await Version.transaction(async (trx) => {
    const maxVersion = (await Version.query(trx)
      .where({ roadmapId: ctx.request.body.roadmapId })
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
        .where({ roadmapId: ctx.request.body.roadmapId })
        .andWhere('sortingRank', '>=', ctx.request.body.sortingRank)
        .increment('sortingRank', 1);
    }

    return await Version.query().insertAndFetch(ctx.request.body);
  });
  ctx.body = inserted;
};

export const deleteVersions: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Version.transaction(async (trx) => {
    const delVersion = await Version.query(trx).findById(ctx.params.id);
    const numDeleted = await Version.query(trx)
      .findById(ctx.params.id)
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

export const patchVersions: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Version.transaction(async (trx) => {
    const originalVersion = await Version.query(trx).findById(ctx.params.id);
    const roadmapId = originalVersion.roadmapId;
    const previousRank = originalVersion.sortingRank;

    if (
      ctx.request.body.sortingRank !== undefined &&
      ctx.request.body.sortingRank !== null &&
      ctx.request.body.sortingRank !== previousRank
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
      if (ctx.request.body.sortingRank > maxRank + 1) {
        ctx.request.body.sortingRank = maxRank + 1;
      }
      await Version.query(trx)
        .where({ roadmapId: roadmapId })
        .andWhere('sortingRank', '>=', ctx.request.body.sortingRank)
        .increment('sortingRank', 1);
    }

    // TODO: separate adding/deleting from updating
    const versionId = parseInt(ctx.params.id);
    let ok = await trx('versionTasks').where('versionId', versionId).delete();
    if (ctx.request.body.tasks?.length) {
      const tasks = ctx.request.body.tasks as number[];
      ok = await trx('versionTasks').insert(
        tasks.map((taskId, order) => ({ taskId, versionId, order })),
      );
    }
    delete ctx.request.body.tasks;

    const patched = await Version.query(trx).patchAndFetchById(
      ctx.params.id,
      ctx.request.body,
    );

    return patched || ok;
  });

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
