import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import {
  getTasks,
  deleteTasks,
  patchTasks,
  postTasks,
  postTasksRatings,
} from './tasks.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import { DefaultState, Context } from 'koa';
const tasksRouter = new KoaRouter<DefaultState, Context>();

tasksRouter.get(
  '/tasks',
  requirePermission(Permission.RoadmapReadUsers),
  getTasks,
);
tasksRouter.post(
  '/tasks',
  requirePermission(Permission.RoadmapReadUsers),
  postTasks,
);
tasksRouter.delete('/tasks/:taskId', requireAuth, deleteTasks);
tasksRouter.patch('/tasks/:taskId', requireAuth, patchTasks);

tasksRouter.post('/tasks/:taskId/ratings', requireAuth, postTasksRatings);

export default tasksRouter;
