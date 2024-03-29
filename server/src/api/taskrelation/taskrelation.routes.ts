import KoaRouter from '@koa/router';
import {
  getRelations,
  deleteRelation,
  addRelation,
  addSynergies,
} from './taskrelation.controller';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaContext, IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
const taskrelationRouter = new KoaRouter<IKoaState, IKoaContext>();

taskrelationRouter.get(
  '/relations',
  requirePermission(Permission.TaskRead),
  getRelations,
);
taskrelationRouter.post(
  '/relations',
  requirePermission(Permission.EditRelations),
  addRelation,
);
taskrelationRouter.post(
  '/relations/synergies',
  requirePermission(Permission.EditRelations),
  addSynergies,
);
taskrelationRouter.delete(
  '/relations',
  requirePermission(Permission.EditRelations),
  deleteRelation,
);

export default taskrelationRouter;
