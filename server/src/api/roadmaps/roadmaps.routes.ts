import { requireAuth } from './../../utils/requireAuth';
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

roadmapRouter.get('/roadmaps', requireAuth, getRoadmaps);
roadmapRouter.post('/roadmaps', requireAuth, postRoadmaps);
roadmapRouter.patch('/roadmaps/:id', requireAuth, patchRoadmaps);
roadmapRouter.delete('/roadmaps/:id', requireAuth, deleteRoadmaps);

roadmapRouter.get('/roadmaps/:id/users', requireAuth, getRoadmapsUsers);
roadmapRouter.get('/roadmaps/:id/tasks', requireAuth, getRoadmapsTasks);
roadmapRouter.post('/roadmaps/:id/tasks', requireAuth, postRoadmapsTasks);

export default roadmapRouter;
