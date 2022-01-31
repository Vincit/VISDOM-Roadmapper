import KoaRouter from '@koa/router';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaContext, IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import {
  getInvitations,
  postInvitation,
  patchInvitation,
  deleteInvitation,
} from './invitations.controller';

const invitationsRouter = new KoaRouter<IKoaState, IKoaContext>();

invitationsRouter.get(
  '/invitations',
  requirePermission(Permission.RoadmapInvite),
  getInvitations,
);

invitationsRouter.post(
  '/invitations',
  requirePermission(Permission.RoadmapInvite),
  postInvitation,
);

invitationsRouter.patch(
  '/invitations/:invitationId',
  requirePermission(Permission.RoadmapInvite),
  patchInvitation,
);

invitationsRouter.delete(
  '/invitations/:invitationId',
  requirePermission(Permission.RoadmapInvite),
  deleteInvitation,
);

export default invitationsRouter;
