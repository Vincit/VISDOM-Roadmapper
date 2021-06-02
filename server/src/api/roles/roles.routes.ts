import KoaRouter from '@koa/router';
import { requirePermission } from './../../utils/checkPermissions';
import { Context } from 'koa';
import { IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import {
  deleteRoadmapUserRoles,
  inviteRoadmapUser,
  patchRoadmapUserRoles,
} from './roles.controller';

const rolesRouter = new KoaRouter<IKoaState, Context>();

rolesRouter.post(
  '/inviteUser',
  requirePermission(Permission.RoadmapEditRoles),
  inviteRoadmapUser,
);

rolesRouter.patch(
  '/users/:userId/roles',
  requirePermission(Permission.RoadmapEditRoles),
  patchRoadmapUserRoles,
);

rolesRouter.delete(
  '/users/:userId/roles',
  requirePermission(Permission.RoadmapEditRoles),
  deleteRoadmapUserRoles,
);

export default rolesRouter;
