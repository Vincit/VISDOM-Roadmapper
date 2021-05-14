import { RouteHandlerFnc } from '../../types/customTypes';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
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
      ...(requirePermission(Permission.TaskWorkRate) && {
        dimension: dimension,
      }),
      ...(requirePermission(Permission.TaskValueRate) && {
        value: value,
      }),
      ...others,
      createdByUser: Number(ctx.state.user.id),
    });
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
  const { taskId, roadmapId, dimension, value, ...others } = ctx.request.body;
  const updated = await Taskrating.query()
    .patchAndFetchById(Number(ctx.params.ratingId), {
      ...(requirePermission(Permission.TaskWorkRate) && {
        dimension: dimension,
      }),
      ...(requirePermission(Permission.TaskValueRate) && {
        value: value,
      }),
      ...others,
    })
    .where({ parentTask: Number(ctx.params.taskId) });

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
