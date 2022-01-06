import { RouteHandlerFnc } from '../../types/customTypes';
import { hasPermission } from './../../utils/checkPermissions';
import {
  Permission,
  TaskRatingDimension,
} from '../../../../shared/types/customTypes';
import Taskrating from './taskratings.model';
import Task from '../tasks/tasks.model';
import Customer from '../customer/customer.model';

export const getTaskratings: RouteHandlerFnc = async (ctx) => {
  const { user, role } = ctx.state;
  if (!user || !role) throw new Error('User and role are required');

  const query = Taskrating.query()
    .where({ parentTask: Number(ctx.params.taskId) })
    .modify('keepVisible', user, role);
  if (ctx.query.eager) query.withGraphFetched('[createdBy, createdFor]');
  ctx.body = await query;
};

export const postTaskRatings: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  const ratings = ctx.request.body;
  const userId = Number(ctx.state.user.id);
  const roadmapId = Number(ctx.params.roadmapId);
  const taskId = Number(ctx.params.taskId);

  if (!Array.isArray(ratings)) return void (ctx.status = 400);

  const hasValueRatePermission = hasPermission(ctx, Permission.TaskValueRate);
  const hasWorkRatePermission = hasPermission(ctx, Permission.TaskWorkRate);

  const errors = await Promise.all(
    ratings.map(async (rating) => {
      if (
        (rating.dimension === TaskRatingDimension.BusinessValue &&
          !hasValueRatePermission) ||
        (rating.dimension === TaskRatingDimension.RequiredWork &&
          !hasWorkRatePermission)
      )
        return { err: 403 };
      if (rating.forCustomer !== undefined) {
        // check that user is representative for given customer
        const found = await Customer.relatedQuery('representatives')
          .for(rating.forCustomer)
          .findById(userId);
        if (!found) return { err: 403 };
      }
      return {};
    }),
  );

  if (errors.some(({ err }: any) => err === 403))
    return void (ctx.status = 403);

  const newRatings = await Taskrating.transaction(
    async (trx) =>
      await Promise.all(
        ratings.map(
          async ({ dimension, value, comment, forCustomer }: any) =>
            await Task.relatedQuery('ratings', trx)
              .for(taskId)
              .insertAndFetch({
                dimension,
                value,
                comment,
                forCustomer,
                parentTask: taskId,
                createdByUser: userId,
              })
              .where({ roadmapId }),
        ),
      ),
  );
  return void (ctx.body = newRatings);
};

export const deleteTaskrating: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');

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

export const patchTaskratings: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  const ratings = ctx.request.body;
  const userId = Number(ctx.state.user.id);
  const taskId = Number(ctx.params.taskId);

  if (!Array.isArray(ratings)) return void (ctx.status = 400);

  const hasValueRatePermission = hasPermission(ctx, Permission.TaskValueRate);
  const hasWorkRatePermission = hasPermission(ctx, Permission.TaskWorkRate);
  const hasEditOthersPermission = hasPermission(
    ctx,
    Permission.TaskRatingEditOthers,
  );

  const foundRatings = await Promise.all(
    ratings.map(async ({ id, value, comment }: any) => {
      const rating = await Taskrating.query()
        .findById(id)
        .where({ parentTask: taskId });
      if (!rating) return { err: 404 };
      if (!hasEditOthersPermission && rating.createdByUser !== userId)
        return { err: 403 };
      if (
        (rating.dimension === TaskRatingDimension.BusinessValue &&
          !hasValueRatePermission) ||
        (rating.dimension === TaskRatingDimension.RequiredWork &&
          !hasWorkRatePermission)
      )
        return { err: 403 };
      return { rating, value, comment };
    }),
  );

  if (foundRatings.some(({ err }: any) => err === 404))
    return void (ctx.status = 404);
  if (foundRatings.some(({ err }: any) => err === 403))
    return void (ctx.status = 403);

  const updated = await Taskrating.transaction(
    async (trx) =>
      await Promise.all(
        foundRatings.map(
          async ({ rating, value, comment }: any) =>
            await rating.$query(trx).patchAndFetch({ value, comment }),
        ),
      ),
  );
  return void (ctx.body = updated);
};
