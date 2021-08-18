import { requireAuth } from './../../utils/requireAuth';
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

const roadmapRouter = new KoaRouter<IKoaState, Context>();

roadmapRouter.use(requireAuth);
roadmapRouter.use('/roadmaps/:roadmapId', requireRole);

roadmapRouter.get('/roadmaps', getRoadmaps);
roadmapRouter.post('/roadmaps', postRoadmaps);
roadmapRouter.patch(
  '/roadmaps/:roadmapId',
  requirePermission(Permission.RoadmapEdit),
  patchRoadmaps,
);
roadmapRouter.delete(
  '/roadmaps/:roadmapId',
  requirePermission(Permission.RoadmapDelete),
  deleteRoadmaps,
);

roadmapRouter.get(
  '/roadmaps/:roadmapId/users',
  requirePermission(Permission.RoadmapReadUsers),
  getRoadmapsUsers,
);

roadmapRouter.use('/roadmaps/:roadmapId', versionsRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', versionsRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', tasksRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', tasksRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', integrationRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', integrationRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', customerRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', customerRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', rolesRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', rolesRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', invitationsRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', invitationsRouter.allowedMethods());

export default roadmapRouter;
