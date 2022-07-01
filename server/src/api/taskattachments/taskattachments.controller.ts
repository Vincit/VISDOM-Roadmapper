import { emitRoadmapEvent } from '../../utils/socketIoUtils';
import { Permission } from '../../../../shared/types/customTypes';
import { ClientEvents } from '../../../../shared/types/sockettypes';
import { RouteHandlerFnc } from '../../types/customTypes';
import Task from '../tasks/tasks.model';
import { TaskAttachment } from './taskattachments.model';

export const postTaskattachments: RouteHandlerFnc = async (ctx) => {
  const { link, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);
  const taskId = Number(ctx.params.taskId);

  const added = await Task.relatedQuery('attachments')
    .for(taskId)
    .insert({ parentTask: taskId, link })
    .where({ roadmapId: Number(ctx.params.roadmapId) });

  await emitRoadmapEvent(ctx.io, {
    roadmapId: Number(ctx.params.roadmapId),
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.TaskRatingRead,
    event: ClientEvents.TASK_UPDATED,
    eventParams: [],
  });
  return void (ctx.body = added);
};

export const deleteTaskattachments: RouteHandlerFnc = async (ctx) => {
  const deleted = await TaskAttachment.query()
    .findById(ctx.params.attachmentId)
    .delete();

  if (deleted === 1) {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.TaskRatingRead,
      event: ClientEvents.TASK_UPDATED,
      eventParams: [],
    });
  }
  ctx.status = deleted === 1 ? 200 : 404;
};

export const patchTaskattachments: RouteHandlerFnc = async (ctx) => {
  const { link, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const patched = await TaskAttachment.query().patchAndFetchById(
    ctx.params.attachmentId,
    { link },
  );
  if (!patched) return void (ctx.status = 404);

  await emitRoadmapEvent(ctx.io, {
    roadmapId: Number(ctx.params.roadmapId),
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.TaskRatingRead,
    event: ClientEvents.TASK_UPDATED,
    eventParams: [],
  });
  return void (ctx.body = patched);
};
