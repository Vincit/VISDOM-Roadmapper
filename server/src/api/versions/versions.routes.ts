import { requireAuth } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import { Context, DefaultState } from 'koa';
import { requirePermission } from './../../utils/checkPermissions';
import { Permission } from '../../types/customTypes';
import {
  deleteVersions,
  getVersions,
  patchVersions,
  postVersions,
} from './versions.controller';
const versionsRouter = new KoaRouter<DefaultState, Context>();

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
