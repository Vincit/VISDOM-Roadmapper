import { requireAuth } from './../../utils/requireAuth';
import { requirePermission, requireRole } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import KoaRouter from '@koa/router';
import {
  getRoadmaps,
  postRoadmaps,
  patchRoadmaps,
  deleteRoadmaps,
  getRoadmapsUsers,
  getCurrentUser,
} from './roadmaps.controller';
import { DefaultState, Context } from 'koa';
import versionsRouter from '../versions/versions.routes';
import tasksRouter from '../tasks/tasks.routes';
import jiraRouter from '../jira/jira.routes';
import jiraConfigurationRouter from '../jiraconfigurations/jiraconfigurations.routes';
const roadmapRouter = new KoaRouter<DefaultState, Context>();

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
roadmapRouter.get('/roadmaps/:roadmapId/whoami', getCurrentUser);

roadmapRouter.use('/roadmaps/:roadmapId', versionsRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', versionsRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', tasksRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', tasksRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', jiraRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', jiraRouter.allowedMethods());

roadmapRouter.use('/roadmaps/:roadmapId', jiraConfigurationRouter.routes());
roadmapRouter.use(
  '/roadmaps/:roadmapId',
  jiraConfigurationRouter.allowedMethods(),
);

export default roadmapRouter;
