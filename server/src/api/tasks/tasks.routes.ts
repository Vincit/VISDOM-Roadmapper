import KoaRouter from '@koa/router';
import {
  getTasks,
  deleteTasks,
  patchTasks,
  postTasks,
} from './tasks.controller';
import { isCurrentTaskCreator } from '../../utils/isCurrent';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import { DefaultState, Context } from 'koa';
import taskratingRouter from '../taskratings/taskratings.routes';
const tasksRouter = new KoaRouter<DefaultState, Context>();

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
  isCurrentTaskCreator,
  deleteTasks,
);
tasksRouter.patch(
  '/tasks/:taskId',
  requirePermission(Permission.TaskEdit),
  isCurrentTaskCreator,
  patchTasks,
);

tasksRouter.use('/tasks/:taskId', taskratingRouter.routes());
tasksRouter.use('/tasks/:taskId', taskratingRouter.allowedMethods());

export default tasksRouter;
