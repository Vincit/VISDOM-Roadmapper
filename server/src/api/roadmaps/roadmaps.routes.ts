import { requireAuth } from './../../utils/requireAuth';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import KoaRouter from '@koa/router';
import {
  getRoadmaps,
  postRoadmaps,
  patchRoadmaps,
  deleteRoadmaps,
  postRoadmapsTasks,
  getRoadmapsTasks,
  getRoadmapsUsers,
} from './roadmaps.controller';
import { DefaultState, Context } from 'koa';
import versionsRouter from '../versions/versions.routes';
const roadmapRouter = new KoaRouter<DefaultState, Context>();

roadmapRouter.use(requireAuth);

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
roadmapRouter.get(
  '/roadmaps/:roadmapId/tasks',
  requirePermission(Permission.Any),
  getRoadmapsTasks,
);
roadmapRouter.post(
  '/roadmaps/:roadmapId/tasks',
  requirePermission(Permission.TaskCreate),
  postRoadmapsTasks,
);

roadmapRouter.use('/roadmaps/:roadmapId', versionsRouter.routes());
roadmapRouter.use('/roadmaps/:roadmapId', versionsRouter.allowedMethods());

export default roadmapRouter;
