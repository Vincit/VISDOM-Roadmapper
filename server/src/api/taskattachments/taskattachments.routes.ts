import KoaRouter from '@koa/router';
import {
  postTaskattachments,
  patchTaskattachments,
  deleteTaskattachments,
} from './taskattachments.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../../../shared/types/customTypes';
import { IKoaContext, IKoaState } from '../../types/customTypes';

const taskattachmentRouter = new KoaRouter<IKoaState, IKoaContext>();

taskattachmentRouter.post(
  '/attachments',
  requirePermission(Permission.TaskCreate),
  postTaskattachments,
);
taskattachmentRouter.patch(
  '/attachments/:attachmentId',
  requirePermission(Permission.TaskEdit),
  patchTaskattachments,
);
taskattachmentRouter.delete(
  '/attachments/:attachmentId',
  requirePermission(Permission.TaskDelete),
  deleteTaskattachments,
);

export default taskattachmentRouter;
