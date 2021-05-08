import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskratings,
  postTasksRatings,
  patchTaskratings,
} from './taskratings.controller';
import { DefaultState, Context } from 'koa';
const taskratingRouter = new KoaRouter<DefaultState, Context>();

taskratingRouter.get('/taskratings', requireAuth, getTaskratings);
taskratingRouter.post('/taskratings', requireAuth, postTasksRatings);
taskratingRouter.patch('/taskratings/:ratingId', requireAuth, patchTaskratings);
taskratingRouter.delete(
  '/taskratings/:ratingId',
  requireAuth,
  deleteTaskratings,
);

export default taskratingRouter;
