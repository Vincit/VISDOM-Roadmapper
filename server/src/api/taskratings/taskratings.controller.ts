import { RouteHandlerFnc } from '../../types/customTypes';
import { hasPermission } from './../../utils/checkPermissions';
import { Permission, TaskRatingDimension } from '../../types/customTypes';
import Taskrating from './taskratings.model';
import Task from '../tasks/tasks.model';

export const getTaskratings: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    ctx.body = await Taskrating.query()
      .for(Number(ctx.params.taskId))
      .withGraphFetched('[createdBy, createdFor]');
  } else {
    ctx.body = await Taskrating.query().where({
      parentTask: Number(ctx.params.taskId),
    });
  }
};

export const postTasksRatings: RouteHandlerFnc = async (ctx, _) => {
  const { dimension, value, comment } = ctx.request.body;
  if (
    (dimension === TaskRatingDimension.BusinessValue &&
      !hasPermission(ctx, Permission.TaskValueRate)) ||
    (dimension === TaskRatingDimension.RequiredWork &&
      !hasPermission(ctx, Permission.TaskWorkRate))
  )
    return void (ctx.status = 403);

  const child = await Task.relatedQuery('ratings')
    .for(Number(ctx.params.taskId))
    .insertAndFetch({
      dimension: dimension,
      value: value,
      comment: comment,
      parentTask: Number(ctx.params.taskId),
      createdByUser: Number(ctx.state.user.id),
    })
    .where({ roadmapId: Number(ctx.params.roadmapId) });
  return void (ctx.body = child);
};

export const deleteTaskratings: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Taskrating.query()
    .findById(Number(ctx.params.ratingId))
    .where({
      parentTask: Number(ctx.params.taskId),
      ...(!hasPermission(ctx, Permission.TaskRatingEditOthers) && {
        createdByUser: Number(ctx.state.user.id),
      }),
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchTaskratings: RouteHandlerFnc = async (ctx, _) => {
  const { value, comment, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  return await Taskrating.transaction(async (trx) => {
    const rating = await Taskrating.query(trx)
      .findById(Number(ctx.params.ratingId))
      .where({ parentTask: Number(ctx.params.taskId) });

    if (!rating) return void (ctx.status = 404);
    if (
      !hasPermission(ctx, Permission.TaskRatingEditOthers) &&
      rating.createdByUser !== ctx.state.user.id
    )
      return void (ctx.status = 403);
    if (
      (rating.dimension === TaskRatingDimension.BusinessValue &&
        !hasPermission(ctx, Permission.TaskValueRate)) ||
      (rating.dimension === TaskRatingDimension.RequiredWork &&
        !hasPermission(ctx, Permission.TaskWorkRate))
    )
      return void (ctx.status = 403);

    return void (ctx.body = await rating
      .$query(trx)
      .patchAndFetch({ value: value, comment: comment }));
  });
};
