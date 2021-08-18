import KoaRouter from '@koa/router';
import { requirePermission } from './../../utils/checkPermissions';
import { Context } from 'koa';
import { IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import {
  addInvitations,
  patchInvitations,
  deleteInvitations,
} from './invitations.controller';

const invitationsRouter = new KoaRouter<IKoaState, Context>();

invitationsRouter.post(
  '/invitations',
  requirePermission(Permission.RoadmapInvite),
  addInvitations,
);

invitationsRouter.patch(
  '/invitations/:invitationId',
  requirePermission(Permission.RoadmapInvite),
  patchInvitations,
);

invitationsRouter.delete(
  '/invitations/:invitationId',
  requirePermission(Permission.RoadmapInvite),
  deleteInvitations,
);

export default invitationsRouter;
