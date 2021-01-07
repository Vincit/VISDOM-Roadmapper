import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import {
  getTasks,
  deleteTasks,
  patchTasks,
  postTasks,
  postTasksRatings,
  postTasksRelatedtasks,
  getTasksRelatedTasks,
} from './tasks.controller';
import { DefaultState, Context } from 'koa';
const tasksRouter = new KoaRouter<DefaultState, Context>();

tasksRouter.get('/tasks', requireAuth, getTasks);
tasksRouter.post('/tasks', requireAuth, postTasks);
tasksRouter.delete('/tasks/:id', requireAuth, deleteTasks);
tasksRouter.patch('/tasks/:id', requireAuth, patchTasks);

tasksRouter.post('/tasks/:id/ratings', requireAuth, postTasksRatings);
tasksRouter.post('/tasks/:id/relatedTasks', requireAuth, postTasksRelatedtasks);
tasksRouter.get('/tasks/:id/relatedTasks', requireAuth, getTasksRelatedTasks);

export default tasksRouter;
