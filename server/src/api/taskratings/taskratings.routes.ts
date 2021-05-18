import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskratings,
  postTasksRatings,
  patchTaskratings,
} from './taskratings.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import { DefaultState, Context } from 'koa';
import { IKoaState } from 'src/types/customTypes';
const taskratingRouter = new KoaRouter<IKoaState, Context>();

taskratingRouter.get(
  '/taskratings',
  requirePermission(Permission.TaskRatingRead),
  getTaskratings,
);
taskratingRouter.post(
  '/taskratings',
  requirePermission(Permission.TaskRate),
  postTasksRatings,
);
taskratingRouter.patch(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  patchTaskratings,
);
taskratingRouter.delete(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  deleteTaskratings,
);

export default taskratingRouter;
