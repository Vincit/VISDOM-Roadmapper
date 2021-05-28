import {
  RouteHandlerFnc,
  Permission,
  TaskRatingDimension,
} from '../../types/customTypes';
import { hasPermission } from './../../utils/checkPermissions';
import Taskrating from './taskratings.model';
import Task from '../tasks/tasks.model';
import Customer from '../customer/customer.model';

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
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const { dimension, value, comment, forCustomer } = ctx.request.body;
  if (
    (dimension === TaskRatingDimension.BusinessValue &&
      !hasPermission(ctx, Permission.TaskValueRate)) ||
    (dimension === TaskRatingDimension.RequiredWork &&
      !hasPermission(ctx, Permission.TaskWorkRate))
  )
    return void (ctx.status = 403);

  const userId = Number(ctx.state.user.id);
  const child = await Task.transaction(async (trx) => {
    if (forCustomer !== undefined) {
      // check that user is representative for given customer
      const found = await Customer.relatedQuery('representatives', trx)
        .for(forCustomer)
        .findById(userId);
      if (!found) return false;
    }
    return await Task.relatedQuery('ratings', trx)
      .for(Number(ctx.params.taskId))
      .insertAndFetch({
        dimension: dimension,
        value: value,
        comment: comment,
        forCustomer: forCustomer,
        parentTask: Number(ctx.params.taskId),
        createdByUser: userId,
      })
      .where({ roadmapId: Number(ctx.params.roadmapId) });
  });
  if (child) {
    ctx.body = child;
  } else {
    ctx.status = 403;
  }
  return;
};

export const deleteTaskratings: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
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
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const { id, value, comment, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  return await Taskrating.transaction(async (trx) => {
    const rating = await Taskrating.query(trx)
      .findById(Number(ctx.params.ratingId))
      .where({ parentTask: Number(ctx.params.taskId) });

    if (!rating) return void (ctx.status = 404);
    if (
      !hasPermission(ctx, Permission.TaskRatingEditOthers) &&
      rating.createdByUser !== ctx.state.user!.id
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
