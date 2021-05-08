import { RouteHandlerFnc } from '../../types/customTypes';
import Task from './tasks.model';
import Roadmap from '../roadmaps/roadmaps.model';
import Objection from 'objection';

export const getTasks: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    ctx.body = await Task.query()
      .where({ roadmapId: Number(ctx.params.roadmapId) })
      .withGraphFetched('[ratings, createdBy]');
  } else {
    ctx.body = await Task.query()
      .where({ roadmapId: Number(ctx.params.roadmapId) })
      .withGraphFetched('[ratings(selectRatingId), createdBy(selectUserId)]')
      .modifiers({
        selectRatingId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('taskratings.id');
        },
        selectUserId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('users.id');
        },
      });
  }
};

export const postTasks: RouteHandlerFnc = async (ctx, _) => {
  const child = await Roadmap.relatedQuery('tasks')
    .for(ctx.params.roadmapId)
    .insertAndFetch({
      ...ctx.request.body,
      roadmapId: Number(ctx.params.roadmapId),
    });

  ctx.body = child;
};

export const deleteTasks: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Task.query()
    .findById(Number(ctx.params.taskId))
    .where({ roadmapId: Number(ctx.params.roadmapId) })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchTasks: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Task.query().patchAndFetchById(
    Number(ctx.params.taskId),
    { ...ctx.request.body, roadmapId: Number(ctx.params.roadmapId) },
  );

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
