import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskrating,
  postTaskRatings,
  updateTaskratings,
} from './taskratings.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../../../shared/types/customTypes';
import { IKoaContext, IKoaState } from '../../types/customTypes';
const taskratingRouter = new KoaRouter<IKoaState, IKoaContext>();

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
  updateTaskratings,
);
taskratingRouter.delete(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  deleteTaskrating,
);

export default taskratingRouter;
