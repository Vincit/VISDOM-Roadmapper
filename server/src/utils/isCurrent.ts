import { Context } from 'koa';
import { Permission } from 'src/types/customTypes';
import Task from '../api/tasks/tasks.model';
import Taskrating from '../api/taskratings/taskratings.model';
import { requirePermission } from '../utils/checkPermissions';

export const isCurrentUser = async (ctx: Context, next: () => Promise<any>) => {
  const user = ctx.state.user;
  const id = Number(ctx.params.id);
  if (user && id && user.id === id) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'No permission';
  }
};

export const isCurrentRoadmap = async (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const body = ctx.request.body;
  const id = Number(ctx.params.roadmapId);
  if (!body.roadmapId || (id && body.roadmapId === id)) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'No permission';
  }
};

export const isCurrentRoadmapsTask = async (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const found = await Task.query()
    .where({
      roadmapId: Number(ctx.params.roadmapId),
    })
    .findById(Number(ctx.params.taskId));
  if (found) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'No permission';
  }
};

export const isCurrentTaskCreator = async (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const task = await Task.query().findById(ctx.params.taskId);
  const id = ctx.state.user.id;
  if (
    (task && id && task.createdBy === id) ||
    requirePermission(Permission.TaskEditOthers)
  ) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'No permission';
  }
};

export const isCurrentTaskRatingCreator = async (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const rating = await Taskrating.query().findById(ctx.params.ratingId);
  const id = ctx.state.user.id;
  if (
    (rating && id && rating.createdBy === id) ||
    requirePermission(Permission.TaskRatingEditOthers)
  ) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'No permission';
  }
};
