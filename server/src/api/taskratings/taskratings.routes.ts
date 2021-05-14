import KoaRouter from '@koa/router';
import {
  getTaskratings,
  deleteTaskratings,
  postTasksRatings,
  patchTaskratings,
} from './taskratings.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import {
  isCurrentRoadmapsTask,
  isCurrentTaskRatingCreator,
} from '../../utils/isCurrent';
import { DefaultState, Context } from 'koa';
const taskratingRouter = new KoaRouter<DefaultState, Context>();

taskratingRouter.get(
  '/taskratings',
  requirePermission(Permission.TaskRatingRead),
  getTaskratings,
);
taskratingRouter.post(
  '/taskratings',
  requirePermission(Permission.TaskRate),
  isCurrentRoadmapsTask,
  postTasksRatings,
);
taskratingRouter.patch(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  isCurrentTaskRatingCreator,
  patchTaskratings,
);
taskratingRouter.delete(
  '/taskratings/:ratingId',
  requirePermission(Permission.TaskRatingEdit),
  isCurrentTaskRatingCreator,
  deleteTaskratings,
);

export default taskratingRouter;
