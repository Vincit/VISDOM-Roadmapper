import { RouteHandlerFnc } from '../../types/customTypes';
import { TaskAttachment } from './taskattachments.model';

export const getTaskattachments: RouteHandlerFnc = async (ctx) => {
  const query = await TaskAttachment.query().where({
    task: Number(ctx.params.taskId),
  });
  ctx.body = query;
};

export const postTaskattachments: RouteHandlerFnc = async (ctx) => {
  const { attachment } = ctx.request.body;
  const task = Number(ctx.params.taskId);
  if (!attachment) return void (ctx.status = 400);
  const addedAttachment = await TaskAttachment.query().insertAndFetch({
    task,
    attachment,
  });
  return void (ctx.body = addedAttachment);
};

export const deleteTaskattachments: RouteHandlerFnc = async (ctx) => {
  const { attachmentId } = ctx.params;
  if (!attachmentId) return void (ctx.status = 400);
  const deleted = await TaskAttachment.query().findById(attachmentId).delete();
  return void (ctx.body = deleted);
};

export const patchTaskattachments: RouteHandlerFnc = async (ctx) => {
  const { attachmentId } = ctx.params;
  const { attachment } = ctx.request.body;
  if (!attachmentId || !attachment) return void (ctx.status = 400);
  const deleted = await TaskAttachment.query().patchAndFetchById(attachmentId, {
    attachment,
  });
  return void (ctx.body = deleted);
};
