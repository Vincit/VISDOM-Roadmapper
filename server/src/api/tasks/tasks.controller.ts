import Objection from 'objection';
import { RouteHandlerFnc } from '../../types/customTypes';
import { userHasPermission } from './../../utils/checkPermissions';
import { Permission } from '../../../../shared/types/customTypes';
import Task from './tasks.model';
import User from '../users/users.model';
import { sendEmail } from '../../utils/sendEmail';
import { isNumberArray } from '../../utils/typeValidation';

export const getTasks: RouteHandlerFnc = async (ctx) => {
  const { user, role } = ctx.state;
  if (!user || !role) {
    throw new Error('User and role are required');
  }

  ctx.body = await Task.query()
    .where({ roadmapId: Number(ctx.params.roadmapId) })
    .withGraphFetched('[ratings(ratingModifier), createdBy(userModifier)]')
    .modifiers(
      ctx.query.eager
        ? {
            ratingModifier: (builder: Objection.AnyQueryBuilder) => {
              builder.modify('keepVisible', user, role);
            },
            userModifier: () => {},
          }
        : {
            ratingModifier: (builder: Objection.AnyQueryBuilder) => {
              builder
                .modify('keepVisible', user, role)
                .select('taskratings.id');
            },
            userModifier: (builder: Objection.AnyQueryBuilder) => {
              builder.select('users.id');
            },
          },
    );
};

export const postTasks: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const { createdAt, id, ...others } = ctx.request.body;
  const task = await Task.query().insertAndFetch({
    ...others,
    roadmapId: Number(ctx.params.roadmapId),
    createdByUser: Number(ctx.state.user.id),
  });

  ctx.body = task;
};

export const deleteTasks: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const numDeleted = await Task.query()
    .findById(Number(ctx.params.taskId))
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      ...(!userHasPermission(ctx, Permission.TaskEditOthers) && {
        createdByUser: Number(ctx.state.user.id),
      }),
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchTasks: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const { id, name, description, completed, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  return await Task.transaction(async (trx) => {
    const task = await Task.query(trx)
      .findById(ctx.params.taskId)
      .where({ roadmapId: Number(ctx.params.roadmapId) });

    if (!task) return void (ctx.status = 404);
    if (
      !userHasPermission(ctx, Permission.TaskEditOthers) &&
      task.createdByUser !== ctx.state.user!.id
    )
      return void (ctx.status = 403);

    return void (ctx.body = await task.$query(trx).patchAndFetch({
      name: name,
      description: description,
      completed: completed,
    }));
  });
};

export const notifyUsers: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const roadmapId = Number(ctx.params.roadmapId);
  const { users: userIds, message, ...rest } = ctx.request.body;
  if (Object.keys(rest).length || !isNumberArray(userIds)) {
    ctx.status = 400;
    return;
  }
  const users = (
    await User.query().findByIds(userIds).withGraphFetched('[roles]')
  ).filter(({ roles }) => roles.some((role) => role.roadmapId === roadmapId));
  if (users.length !== userIds.length) {
    ctx.status = 400;
    return;
  }
  // TODO: link to the actual task, where the user can give the rating
  const messageBody = `${ctx.state.user.email} has requested your rating for the task ${ctx.params.taskId}.\r\n\r\n${message}`;
  users.forEach(({ email }) => {
    sendEmail(email, 'Task rating notification', messageBody);
  });
  ctx.status = 200;
};
