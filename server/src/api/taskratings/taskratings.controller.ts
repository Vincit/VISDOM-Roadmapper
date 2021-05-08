import { RouteHandlerFnc } from '../../types/customTypes';
import Taskrating from './taskratings.model';
import Task from '../tasks/tasks.model';

export const getTaskratings: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    ctx.body = await Taskrating.query()
      .for(Number(ctx.params.taskId))
      .withGraphFetched('[createdBy]');
  } else {
    ctx.body = await Taskrating.query().where({
      parentTask: Number(ctx.params.taskId),
    });
  }
};

export const postTasksRatings: RouteHandlerFnc = async (ctx, _) => {
  const child = await Task.relatedQuery('ratings')
    .for(Number(ctx.params.taskId))
    .insertAndFetch(ctx.request.body);
  ctx.body = child;
};

export const deleteTaskratings: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Taskrating.query()
    .findById(Number(ctx.params.ratingId))
    .where({ parentTask: Number(ctx.params.taskId) })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchTaskratings: RouteHandlerFnc = async (ctx, _) => {
  const updated = await Taskrating.query()
    .patchAndFetchById(Number(ctx.params.ratingId), ctx.request.body)
    .where({ parentTask: Number(ctx.params.taskId) });

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
