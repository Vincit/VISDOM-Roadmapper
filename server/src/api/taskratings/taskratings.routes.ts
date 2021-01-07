import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskratings,
  postTaskratings,
  patchTaskratings,
} from './taskratings.controller';
import { DefaultState, Context } from 'koa';
const taskratingRouter = new KoaRouter<DefaultState, Context>();

taskratingRouter.get('/taskratings', requireAuth, getTaskratings);
taskratingRouter.post('/taskratings', requireAuth, postTaskratings);
taskratingRouter.delete('/taskratings/:id', requireAuth, deleteTaskratings);
taskratingRouter.patch('/taskratings/:id', requireAuth, patchTaskratings);

export default taskratingRouter;
