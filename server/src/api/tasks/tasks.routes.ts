import KoaRouter from '@koa/router';
import {
  getTasks,
  deleteTasks,
  patchTasks,
  postTasks,
} from './tasks.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaState, Permission } from '../../types/customTypes';
import { DefaultState, Context } from 'koa';
import taskratingRouter from '../taskratings/taskratings.routes';
const tasksRouter = new KoaRouter<IKoaState, Context>();

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

tasksRouter.use('/tasks/:taskId', taskratingRouter.routes());
tasksRouter.use('/tasks/:taskId', taskratingRouter.allowedMethods());

export default tasksRouter;
