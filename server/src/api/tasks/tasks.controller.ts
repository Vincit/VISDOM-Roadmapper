import { RouteHandlerFnc } from '../../types/customTypes';
import { hasPermission } from './../../utils/checkPermissions';
import { Permission } from '../../../../shared/types/customTypes';
import Task from './tasks.model';
import Objection from 'objection';

export const getTasks: RouteHandlerFnc = async (ctx, _) => {
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

export const postTasks: RouteHandlerFnc = async (ctx, _) => {
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

export const deleteTasks: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const numDeleted = await Task.query()
    .findById(Number(ctx.params.taskId))
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      ...(!hasPermission(ctx, Permission.TaskEditOthers) && {
        createdByUser: Number(ctx.state.user.id),
      }),
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const patchTasks: RouteHandlerFnc = async (ctx, _) => {
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
      !hasPermission(ctx, Permission.TaskEditOthers) &&
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
