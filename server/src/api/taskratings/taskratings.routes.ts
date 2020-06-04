import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskratings,
  postTaskratings,
  patchTaskratings,
} from './taskratings.controller';
import { DefaultState, Context } from 'koa';
const taskratingRouter = new KoaRouter<DefaultState, Context>();

taskratingRouter.get('/taskratings', getTaskratings);
taskratingRouter.post('/taskratings', postTaskratings);
taskratingRouter.delete('/taskratings/:id', deleteTaskratings);
taskratingRouter.patch('/taskratings/:id', patchTaskratings);

export default taskratingRouter;
