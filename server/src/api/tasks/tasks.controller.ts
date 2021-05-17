import { RouteHandlerFnc } from '../../types/customTypes';
import { hasPermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import Task from './tasks.model';
import Objection from 'objection';

export const getTasks: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.query.eager) {
    ctx.body = await Task.query()
      .where({ roadmapId: Number(ctx.params.roadmapId) })
      .withGraphFetched('[ratings, createdBy]');
  } else {
    ctx.body = await Task.query()
      .where({ roadmapId: Number(ctx.params.roadmapId) })
      .withGraphFetched('[ratings(selectRatingId), createdBy(selectUserId)]')
      .modifiers({
        selectRatingId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('taskratings.id');
        },
        selectUserId: (builder: Objection.AnyQueryBuilder) => {
          builder.select('users.id');
        },
      });
  }
};

export const postTasks: RouteHandlerFnc = async (ctx, _) => {
  const { jiraId, createdAt, ...others } = ctx.request.body;
  const task = await Task.query().insertAndFetch({
    ...others,
    roadmapId: Number(ctx.params.roadmapId),
    createdByUser: Number(ctx.state.user.id),
  });

  ctx.body = task;
};

export const deleteTasks: RouteHandlerFnc = async (ctx, _) => {
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
  const { jiraId, createdAt, createdBy, ...others } = ctx.request.body;
  const updated = await Task.query()
    .patchAndFetchById(Number(ctx.params.taskId), {
      ...others,
      roadmapId: Number(ctx.params.roadmapId),
    })
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      id: Number(ctx.params.taskId),
      ...(!hasPermission(ctx, Permission.TaskEditOthers) && {
        createdByUser: Number(ctx.state.user.id),
      }),
    });

  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};
