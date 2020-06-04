import { RouteHandlerFnc } from '../../types/customTypes';
import Roadmap from './roadmaps.model';
import Objection from 'objection';

export const getRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    const eagerResult = await Roadmap.query()
      .withGraphFetched('[tasks.[ratings, relatedTasks(selectTaskId)]]')
      .modifiers({
        selectTaskId: (builder) => {
          builder.select('tasks.id');
        },
      });
    ctx.body = eagerResult;
  } else {
    const eagerResult = await Roadmap.query()
      .withGraphFetched('[tasks(selectTaskId)]')
      .modifiers({
        selectTaskId: (builder) => {
          builder.select('tasks.id');
        },
      });
    ctx.body = eagerResult;
  }
};

export const postRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await Roadmap.query().insert(ctx.request.body);
};

export const patchRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Roadmap.query().patchAndFetchById(
    ctx.params.id,
    ctx.request.body,
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};

export const deleteRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Roadmap.query().findById(ctx.params.id).delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const postRoadmapsTasks: RouteHandlerFnc = async (ctx, _) => {
  const child = await Roadmap.relatedQuery('tasks')
    .for(ctx.params.id)
    .insert(ctx.request.body);

  ctx.body = child;
};

export const getRoadmapsTasks: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    const eagerResult = await Roadmap.relatedQuery('tasks')
      .for(ctx.params.id)
      .withGraphFetched('[ratings, relatedTasks(selectTaskId)]')
      .modifiers({
        selectTaskId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('tasks.id');
        },
      });
    ctx.body = eagerResult;
  } else {
    const tasks = await Roadmap.relatedQuery('tasks')
      .for(ctx.params.id)
      .select('tasks.id');
    ctx.body = tasks;
  }
};
