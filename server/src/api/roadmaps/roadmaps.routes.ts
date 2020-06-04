import KoaRouter from '@koa/router';
import {
  getRoadmaps,
  postRoadmaps,
  patchRoadmaps,
  deleteRoadmaps,
  postRoadmapsTasks,
  getRoadmapsTasks,
} from './roadmaps.controller';
import { DefaultState, Context } from 'koa';
const roadmapRouter = new KoaRouter<DefaultState, Context>();

roadmapRouter.get('/roadmaps', getRoadmaps);
roadmapRouter.post('/roadmaps', postRoadmaps);
roadmapRouter.patch('/roadmaps/:id', patchRoadmaps);
roadmapRouter.delete('/roadmaps/:id', deleteRoadmaps);

roadmapRouter.get('/roadmaps/:id/tasks', getRoadmapsTasks);
roadmapRouter.post('/roadmaps/:id/tasks', postRoadmapsTasks);

export default roadmapRouter;
