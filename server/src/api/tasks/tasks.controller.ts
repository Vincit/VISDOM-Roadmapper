import { emitRoadmapEvent } from './../../utils/socketIoUtils';
import Objection from 'objection';
import { RouteHandlerFnc } from '../../types/customTypes';
import { userHasPermission } from './../../utils/checkPermissions';
import { Permission } from '../../../../shared/types/customTypes';
import Task from './tasks.model';
import User from '../users/users.model';
import { sendEmail } from '../../utils/sendEmail';
import {
  isArray,
  isNumberArray,
  isRecord,
  isString,
} from '../../utils/typeValidation';
import { ClientEvents } from '../../../../shared/types/sockettypes';
import { notifyUsersEmail } from '../../utils/emailMessages';

export const getTasks: RouteHandlerFnc = async (ctx) => {
  const { user, role } = ctx.state;
  if (!user || !role) {
    throw new Error('User and role are required');
  }

  ctx.body = await Task.query()
    .where({ roadmapId: Number(ctx.params.roadmapId) })
    .withGraphFetched(
      '[attachments, ratings(ratingModifier), createdBy(userModifier), lastUpdatedBy(userModifier)]',
    )
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
  if (!ctx.state.user) throw new Error('User is required');
  const { createdAt, id, attachments, ...others } = ctx.request.body;
  if (!isArray(isRecord({ attachment: isString }))(attachments))
    return void (ctx.status = 400);

  const { user, role } = ctx.state;
  const roadmapId = Number(ctx.params.roadmapId);

  let task = await Task.transaction(async (trx) => {
    const created = await Task.query(trx).insertAndFetch({
      ...others,
      roadmapId,
      createdByUser: Number(ctx.state.user!.id),
    });

    await Promise.all(
      attachments.map(({ attachment }) =>
        Task.relatedQuery('attachments', trx)
          .for(created.id)
          .insert({ parentTask: created.id, attachment })
          .where({ roadmapId }),
      ),
    );
    return created;
  });

  const graphTask = await task
    .$fetchGraph(
      '[attachments, ratings(ratingModifier), createdBy(userModifier), lastUpdatedBy(userModifier)]',
    )
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

  await emitRoadmapEvent(ctx.io, {
    roadmapId: Number(ctx.params.roadmapId),
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.TaskRead,
    event: ClientEvents.TASK_UPDATED,
    eventParams: [],
  });

  return void (ctx.body = graphTask);
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

  if (numDeleted === 1) {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.TaskRead,
      event: ClientEvents.TASK_UPDATED,
      eventParams: [],
    });
  }
  ctx.status = numDeleted === 1 ? 200 : 404;
};

export const patchTasks: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const {
    id,
    name,
    description,
    status,
    attachments,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const res = await Task.transaction(async (trx) => {
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
      status: status,
      lastUpdatedByUserId: ctx.state.user!.id,
    }));
  });

  await emitRoadmapEvent(ctx.io, {
    roadmapId: Number(ctx.params.roadmapId),
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.TaskRead,
    event: ClientEvents.TASK_UPDATED,
    eventParams: [],
  });

  return res;
};

const BASE_URL = process.env.FRONTEND_BASE_URL!;
export const notifyUsers: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const roadmapId = Number(ctx.params.roadmapId);
  const senderEmail = ctx.state.user.email;
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
  const task = await Task.query().findById(ctx.params.taskId);
  if (!task) {
    ctx.status = 404;
    return;
  }

  const taskUrl = `${BASE_URL}/roadmap/${roadmapId}/tasks/${ctx.params.taskId}`;
  const messageBody = `${senderEmail} has requested your rating for the task ${task.name} at ${taskUrl}.\r\n\r\n${message}`;
  users.forEach(({ email }) => {
    sendEmail(
      email,
      'Task rating notification',
      messageBody,
      notifyUsersEmail({
        baseUrl: BASE_URL,
        taskUrl,
        taskName: task.name,
        senderEmail,
        message: message ? `"${message}"` : '',
      }),
    );
  });
  ctx.status = 200;
};
