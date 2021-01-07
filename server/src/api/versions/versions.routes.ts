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

versionsRouter.get('/versions', requireAuth, getVersions);
versionsRouter.post('/versions', requireAuth, postVersions);
versionsRouter.patch('/versions/:id', requireAuth, patchVersions);
versionsRouter.delete('/versions/:id', requireAuth, deleteVersions);

export default versionsRouter;
