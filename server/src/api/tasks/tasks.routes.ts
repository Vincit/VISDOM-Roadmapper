import KoaRouter from '@koa/router';
import {
  getTasks,
  deleteTasks,
  patchTasks,
  postTasks,
  notifyUsers,
} from './tasks.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaContext, IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import taskratingRouter from '../taskratings/taskratings.routes';
import taskrelationRouter from '../taskrelation/taskrelation.routes';
import taskattachmentRouter from '../taskattachments/taskattachments.routes';
const tasksRouter = new KoaRouter<IKoaState, IKoaContext>();

tasksRouter.use('/tasks', taskrelationRouter.routes());
tasksRouter.use('/tasks', taskrelationRouter.allowedMethods());

tasksRouter.get(
  '/tasks',
  requirePermission(Permission.RoadmapReadUsers | Permission.TaskRead),
  getTasks,
);
tasksRouter.post(
  '/tasks',
  requirePermission(Permission.RoadmapReadUsers | Permission.TaskCreate),
  postTasks,
);
tasksRouter.delete(
  '/tasks/:taskId',
  requirePermission(Permission.TaskEdit),
  deleteTasks,
);
tasksRouter.patch(
  '/tasks/:taskId',
  requirePermission(Permission.TaskEdit),
  patchTasks,
);
tasksRouter.post(
  '/tasks/:taskId/notify',
  requirePermission(Permission.RoadmapReadUsers | Permission.TaskEdit),
  notifyUsers,
);

tasksRouter.use('/tasks/:taskId', taskratingRouter.routes());
tasksRouter.use('/tasks/:taskId', taskratingRouter.allowedMethods());

tasksRouter.use('/tasks/:taskId', taskattachmentRouter.routes());
tasksRouter.use('/tasks/:taskId', taskattachmentRouter.allowedMethods());

export default tasksRouter;
