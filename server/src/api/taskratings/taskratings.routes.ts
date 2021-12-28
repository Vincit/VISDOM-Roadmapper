import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskrating,
  postTaskRatings,
  postTaskRating,
  patchTaskratings,
  patchTaskrating,
} from './taskratings.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Context } from 'koa';
import { Permission } from '../../../../shared/types/customTypes';
import { IKoaState } from '../../types/customTypes';
const taskratingRouter = new KoaRouter<IKoaState, Context>();

taskratingRouter.get(
  '/taskratings',
  requirePermission(Permission.TaskRatingRead),
  getTaskratings,
);
taskratingRouter.post(
  '/taskrating',
  requirePermission(Permission.TaskRate),
  postTaskRating,
);
taskratingRouter.post(
  '/taskratings',
  requirePermission(Permission.TaskRate),
  postTaskRatings,
);
taskratingRouter.patch(
  '/taskratings',
  requirePermission(Permission.TaskRatingEdit),
  patchTaskratings,
);
taskratingRouter.patch(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  patchTaskrating,
);
taskratingRouter.delete(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  deleteTaskrating,
);

export default taskratingRouter;
