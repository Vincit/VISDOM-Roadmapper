import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskrating,
  postTaskRatings,
  patchTaskratings,
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
  '/taskratings',
  requirePermission(Permission.TaskRate),
  postTaskRatings,
);
taskratingRouter.patch(
  '/taskratings',
  requirePermission(Permission.TaskRatingEdit),
  patchTaskratings,
);
taskratingRouter.delete(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  deleteTaskrating,
);

export default taskratingRouter;
