import { RouteHandlerFnc } from '../../types/customTypes';
import Roadmap from './roadmaps.model';

export const getRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    const eagerResult = await Roadmap.query().withGraphFetched(
      '[tasks.ratings, jiraconfiguration]',
    );
    ctx.body = eagerResult;
  } else {
    const eagerResult = await Roadmap.query().withGraphFetched(
      '[tasks(selectTaskId)]',
    );
    ctx.body = eagerResult;
  }
};

export const getRoadmapsUsers: RouteHandlerFnc = async (ctx, _) => {
  const users = await Roadmap.relatedQuery('users').for(ctx.params.roadmapId);
  ctx.body = users;
};

export const postRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await Roadmap.query().insertAndFetch(ctx.request.body);
};

export const patchRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Roadmap.query().patchAndFetchById(
    ctx.params.roadmapId,
    ctx.request.body,
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};

export const deleteRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Roadmap.query()
    .findById(ctx.params.roadmapId)
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const postRoadmapsTasks: RouteHandlerFnc = async (ctx, _) => {
  const child = await Roadmap.relatedQuery('tasks')
    .for(ctx.params.roadmapId)
    .insertAndFetch(ctx.request.body);

  ctx.body = child;
};

export const getRoadmapsTasks: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    const eagerResult = await Roadmap.relatedQuery('tasks')
      .for(ctx.params.roadmapId)
      .withGraphFetched('ratings');
    ctx.body = eagerResult;
  } else {
    const tasks = await Roadmap.relatedQuery('tasks')
      .for(ctx.params.roadmapId)
      .select('tasks.id');
    ctx.body = tasks;
  }
};
