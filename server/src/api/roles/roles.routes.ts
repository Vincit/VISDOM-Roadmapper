import KoaRouter from '@koa/router';
import { requirePermission, requireRole } from './../../utils/checkPermissions';
import { Context, DefaultState } from 'koa';
import { Permission } from 'src/types/customTypes';
import {
  deleteRoadmapUserRoles,
  inviteRoadmapUser,
  patchRoadmapUserRoles,
} from './roles.controller';

const rolesRouter = new KoaRouter<DefaultState, Context>();

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
