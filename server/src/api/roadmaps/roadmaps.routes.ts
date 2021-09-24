import { requireAuth, requireVerifiedEmail } from './../../utils/requireAuth';
import { requirePermission, requireRole } from './../../utils/checkPermissions';
import { IKoaState } from '../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import KoaRouter from '@koa/router';
import {
  getRoadmaps,
  postRoadmaps,
  patchRoadmaps,
  deleteRoadmaps,
  getRoadmapsUsers,
} from './roadmaps.controller';
import { Context } from 'koa';
import versionsRouter from '../versions/versions.routes';
import tasksRouter from '../tasks/tasks.routes';
import integrationRouter from '../integration/integration.routes';
import customerRouter from '../customer/customer.routes';
import rolesRouter from '../roles/roles.routes';
import invitationsRouter from '../invitations/invitations.routes';

const roadmapRouter = new KoaRouter<IKoaState, Context>({
  prefix: '/roadmaps',
});

roadmapRouter.use(requireAuth);
roadmapRouter.use('/:roadmapId', requireRole);

roadmapRouter.get('/', getRoadmaps);

roadmapRouter.use(requireVerifiedEmail);

roadmapRouter.post('/', postRoadmaps);
roadmapRouter.patch(
  '/:roadmapId',
  requirePermission(Permission.RoadmapEdit),
  patchRoadmaps,
);
roadmapRouter.delete(
  '/:roadmapId',
  requirePermission(Permission.RoadmapDelete),
  deleteRoadmaps,
);

roadmapRouter.get(
  '/:roadmapId/users',
  requirePermission(Permission.RoadmapReadUsers),
  getRoadmapsUsers,
);

roadmapRouter.use('/:roadmapId', versionsRouter.routes());
roadmapRouter.use('/:roadmapId', versionsRouter.allowedMethods());

roadmapRouter.use('/:roadmapId', tasksRouter.routes());
roadmapRouter.use('/:roadmapId', tasksRouter.allowedMethods());

roadmapRouter.use('/:roadmapId', integrationRouter.routes());
roadmapRouter.use('/:roadmapId', integrationRouter.allowedMethods());

roadmapRouter.use('/:roadmapId', customerRouter.routes());
roadmapRouter.use('/:roadmapId', customerRouter.allowedMethods());

roadmapRouter.use('/:roadmapId', rolesRouter.routes());
roadmapRouter.use('/:roadmapId', rolesRouter.allowedMethods());

roadmapRouter.use('/:roadmapId', invitationsRouter.routes());
roadmapRouter.use('/:roadmapId', invitationsRouter.allowedMethods());

export default roadmapRouter;
