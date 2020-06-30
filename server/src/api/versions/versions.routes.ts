import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import {
  deleteVersions,
  getVersions,
  patchVersions,
  postVersions,
} from './versions.controller';
const versionsRouter = new KoaRouter<DefaultState, Context>();

versionsRouter.get('/versions', getVersions);
versionsRouter.post('/versions', postVersions);
versionsRouter.patch('/versions/:id', patchVersions);
versionsRouter.delete('/versions/:id', deleteVersions);

export default versionsRouter;
