import { ClientEvents } from './../../../../shared/types/sockettypes';
import { emitRoadmapEvent } from './../../utils/socketIoUtils';
import { RouteHandlerFnc } from '../../types/customTypes';
import { userHasPermission } from './../../utils/checkPermissions';
import {
  isNumber,
  isString,
  isOptional,
  isRecord,
  isArray,
} from './../../utils/typeValidation';
import {
  Permission,
  TaskRatingDimension,
} from '../../../../shared/types/customTypes';
import Taskrating from './taskratings.model';
import Task from '../tasks/tasks.model';
import Customer from '../customer/customer.model';
import { revertScale } from '../../../../shared/utils/conversion';

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

  if (
    !isArray(
      isRecord({
        dimension: isNumber,
        forCustomer: isOptional(isNumber),
        value: isNumber,
        comment: isOptional(isString),
      }),
    )(ratings)
  )
    return void (ctx.status = 400);

  const hasValueRatePermission = userHasPermission(
    ctx,
    Permission.TaskValueRate,
  );
  const hasComplexityRatePermission = userHasPermission(
    ctx,
    Permission.TaskComplexityRate,
  );

  const errors = await Promise.all(
    ratings.map(async (rating) => {
      if (
        (rating.dimension === TaskRatingDimension.BusinessValue &&
          !hasValueRatePermission) ||
        (rating.dimension === TaskRatingDimension.Complexity &&
          !hasComplexityRatePermission)
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

  if (errors.some(({ err }) => err === 403)) return void (ctx.status = 403);

  const newRatings = await Taskrating.transaction((trx) =>
    Promise.all(
      ratings.map(({ dimension, value, comment, forCustomer }) =>
        Task.relatedQuery('ratings', trx)
          .for(taskId)
          .insertAndFetch({
            dimension,
            value: revertScale(value),
            comment,
            forCustomer,
            parentTask: taskId,
            createdByUser: userId,
          })
          .where({ roadmapId }),
      ),
    ),
  );

  await emitRoadmapEvent(ctx.io, {
    roadmapId: Number(ctx.params.roadmapId),
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.TaskRatingRead,
    event: ClientEvents.TASK_UPDATED,
    eventParams: [],
  });

  return void (ctx.body = newRatings);
};

export const deleteTaskrating: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');

  const numDeleted = await Taskrating.query()
    .findById(Number(ctx.params.ratingId))
    .where({
      parentTask: Number(ctx.params.taskId),
      ...(!userHasPermission(ctx, Permission.TaskRatingEditOthers) && {
        createdByUser: Number(ctx.state.user.id),
      }),
    })
    .delete();

  if (numDeleted === 1) {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.TaskRatingRead,
      event: ClientEvents.TASK_UPDATED,
      eventParams: [],
    });
  }
  ctx.status = numDeleted === 1 ? 200 : 404;
};

export const updateTaskratings: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  const ratings = ctx.request.body;
  const userId = Number(ctx.state.user.id);
  const taskId = Number(ctx.params.taskId);

  if (
    !isArray(
      isRecord({
        id: isNumber,
        value: isNumber,
        comment: isOptional(isString),
      }),
    )(ratings)
  )
    return void (ctx.status = 400);

  const hasValueRatePermission = userHasPermission(
    ctx,
    Permission.TaskValueRate,
  );
  const hasComplexityRatePermission = userHasPermission(
    ctx,
    Permission.TaskComplexityRate,
  );
  const hasEditOthersPermission = userHasPermission(
    ctx,
    Permission.TaskRatingEditOthers,
  );

  const foundRatings = await Promise.all(
    ratings.map(async ({ id, value, comment }) => {
      const rating = await Taskrating.query()
        .findById(id)
        .where({ parentTask: taskId });
      if (!rating) return { err: 404 };
      if (!hasEditOthersPermission && rating.createdByUser !== userId)
        return { err: 403 };
      if (
        (rating.dimension === TaskRatingDimension.BusinessValue &&
          !hasValueRatePermission) ||
        (rating.dimension === TaskRatingDimension.Complexity &&
          !hasComplexityRatePermission)
      )
        return { err: 403 };
      return { rating, value, comment };
    }),
  );

  if (foundRatings.some(({ err }) => err === 404))
    return void (ctx.status = 404);
  if (foundRatings.some(({ err }) => err === 403))
    return void (ctx.status = 403);

  const result = await Taskrating.transaction(async (trx) => {
    const toDelete = foundRatings.flatMap(({ value, rating }) =>
      !value && rating ? [rating.id] : [],
    );
    await Taskrating.query(trx).findByIds(toDelete).delete();

    const updated = await Promise.all(
      foundRatings.flatMap(({ rating, value, comment }) =>
        rating
          ? [
              rating
                .$query(trx)
                .patchAndFetch({ value: revertScale(value), comment }),
            ]
          : [],
      ),
    );
    return { deleted: toDelete, updated };
  });

  await emitRoadmapEvent(ctx.io, {
    roadmapId: Number(ctx.params.roadmapId),
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.TaskRatingRead,
    event: ClientEvents.TASK_UPDATED,
    eventParams: [],
  });

  return void (ctx.body = result);
};
