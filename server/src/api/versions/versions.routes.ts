import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import {
  deleteVersions,
  getVersions,
  patchVersions,
  postVersions,
} from './versions.controller';
const versionsRouter = new KoaRouter<DefaultState, Context>();

versionsRouter.get('/roadmaps/:roadmapId/versions/', requireAuth, getVersions);

versionsRouter.post(
  '/roadmaps/:roadmapId/versions/',
  requireAuth,
  postVersions,
);

versionsRouter.patch(
  '/roadmaps/:roadmapId/versions/:versionId',
  requireAuth,
  patchVersions,
);

versionsRouter.delete(
  '/roadmaps/:roadmapId/versions/:versionId',
  requireAuth,
  deleteVersions,
);
export default versionsRouter;
