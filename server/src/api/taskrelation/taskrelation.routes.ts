import KoaRouter from '@koa/router';
import {
  getRelations,
  deleteRelation,
  addRelation,
  addSynergies,
} from './taskrelation.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { Context } from 'koa';
import { IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
const taskrelationRouter = new KoaRouter<IKoaState, Context>();

taskrelationRouter.get(
  '/relations',
  requirePermission(Permission.TaskRead),
  getRelations,
);
taskrelationRouter.post(
  '/relations',
  requirePermission(Permission.TaskRead | Permission.RoadmapEdit),
  addRelation,
);
taskrelationRouter.post(
  '/relations/synergies',
  requirePermission(Permission.TaskRead | Permission.RoadmapEdit),
  addSynergies,
);
taskrelationRouter.delete(
  '/relations',
  requirePermission(Permission.TaskRead | Permission.RoadmapEdit),
  deleteRelation,
);

export default taskrelationRouter;
