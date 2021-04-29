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
const roadmapRouter = new KoaRouter<DefaultState, Context>();

roadmapRouter.use(requireAuth);

roadmapRouter.get('/roadmaps', getRoadmaps);
roadmapRouter.post('/roadmaps', postRoadmaps);
roadmapRouter.patch(
  '/roadmaps/:id',
  requirePermission(Permission.RoadmapEdit),
  patchRoadmaps,
);
roadmapRouter.delete(
  '/roadmaps/:id',
  requirePermission(Permission.RoadmapDelete),
  deleteRoadmaps,
);

roadmapRouter.get(
  '/roadmaps/:id/users',
  requirePermission(Permission.RoadmapReadUsers),
  getRoadmapsUsers,
);
roadmapRouter.get(
  '/roadmaps/:id/tasks',
  requirePermission(Permission.TaskCreate),
  getRoadmapsTasks,
);
roadmapRouter.post(
  '/roadmaps/:id/tasks',
  requirePermission(Permission.TaskCreate),
  postRoadmapsTasks,
);

export default roadmapRouter;
