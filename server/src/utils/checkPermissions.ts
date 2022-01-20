import { Context } from 'koa';
import { Role } from '../api/roles/roles.model';
import { hasPermission } from '../../../shared/utils/permission';

export class ForbiddenError extends Error {}

export const requireRole = async (ctx: Context, next: () => Promise<any>) => {
  const uid = ctx.state.user?.id;
  const roadmap = Number(ctx.params.roadmapId);
  const role =
    ctx.state.user &&
    !isNaN(uid) &&
    !isNaN(roadmap) &&
    (await Role.query().findById([uid, roadmap]));
  if (role) {
    ctx.state.role = role.type;
    await next();
  } else {
    throw new ForbiddenError('Role required');
  }
};

export const requirePermission = (permission: number) => (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const check = async () => {
    if (!userHasPermission(ctx, permission)) {
      throw new ForbiddenError('No permission');
    }
    await next();
  };
  return ctx.state.role === undefined ? requireRole(ctx, check) : check();
};

export const userHasPermission = (ctx: Context, permission: number) => {
  const role = ctx.state.role;
  return hasPermission(role, permission);
};
