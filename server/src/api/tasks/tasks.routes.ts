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

tasksRouter.get('/tasks', getTasks);
tasksRouter.post('/tasks', postTasks);
tasksRouter.delete('/tasks/:id', deleteTasks);
tasksRouter.patch('/tasks/:id', patchTasks);

tasksRouter.post('/tasks/:id/ratings', postTasksRatings);
tasksRouter.post('/tasks/:id/relatedTasks', postTasksRelatedtasks);
tasksRouter.get('/tasks/:id/relatedTasks', getTasksRelatedTasks);

export default tasksRouter;
