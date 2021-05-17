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
  const { dimension, value, ...others } = ctx.request.body;

  const child = await Task.relatedQuery('ratings')
    .for(Number(ctx.params.taskId))
    .insertAndFetch({
      ...(((dimension === TaskRatingDimension.BusinessValue &&
        hasPermission(ctx, Permission.TaskValueRate)) ||
        (dimension === TaskRatingDimension.RequiredWork &&
          hasPermission(ctx, Permission.TaskWorkRate))) && {
        dimension: dimension,
        value: value,
        ...others,
        createdByUser: Number(ctx.state.user.id),
      }),
    })
    .where({ roadmapId: Number(ctx.params.roadmapId) });
  ctx.body = child;
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
  const { taskId, roadmapId, dimension, value, ...others } = ctx.request.body;

  const updated = await Taskrating.query()
    .patchAndFetchById(Number(ctx.params.ratingId), {
      ...(((dimension === TaskRatingDimension.BusinessValue &&
        hasPermission(ctx, Permission.TaskValueRate)) ||
        (dimension === TaskRatingDimension.RequiredWork &&
          hasPermission(ctx, Permission.TaskWorkRate))) && {
        value: value,
        ...others,
      }),
    })
    .where({
      parentTask: Number(ctx.params.taskId),
      dimension: dimension,
      ...(!hasPermission(ctx, Permission.TaskRatingEditOthers) && {
        createdByUser: Number(ctx.state.user.id),
      }),
    });

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
