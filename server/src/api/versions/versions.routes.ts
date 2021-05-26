import KoaRouter from '@koa/router';
import { Context } from 'koa';
import { requirePermission } from './../../utils/checkPermissions';
import { IKoaState, Permission } from '../../types/customTypes';
import {
  deleteVersions,
  getVersions,
  patchVersions,
  postVersions,
} from './versions.controller';
const versionsRouter = new KoaRouter<IKoaState, Context>();

versionsRouter.get(
  '/versions/',
  requirePermission(Permission.VersionRead),
  getVersions,
);

versionsRouter.post(
  '/versions/',
  requirePermission(Permission.VersionCreate | Permission.RoadmapEdit),
  postVersions,
);

versionsRouter.patch(
  '/versions/:versionId',
  requirePermission(Permission.VersionEdit),
  patchVersions,
);

versionsRouter.delete(
  '/versions/:versionId',
  requirePermission(Permission.VersionDelete | Permission.RoadmapEdit),
  deleteVersions,
);
export default versionsRouter;
