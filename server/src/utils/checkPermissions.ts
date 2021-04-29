import { Context } from 'koa';
import { Role } from '../api/roles/roles.model';

export class ForbiddenError extends Error {}

export const requireRole = async (ctx: Context, next: () => Promise<any>) => {
  const user = Number(ctx.state.user.id);
  const roadmap = Number(ctx.params.roadmapId);
  const role =
    !isNaN(user) &&
    !isNaN(roadmap) &&
    (await Role.query().findById([user, roadmap]));
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
    if (!hasPermission(ctx, permission)) {
      throw new ForbiddenError('No permission');
    }
    await next();
  };
  return ctx.state.role === undefined ? requireRole(ctx, check) : check();
};

export const hasPermission = (ctx: Context, permission: number) => {
  const role = ctx.state.role;
  return role !== undefined && (role & permission) === permission;
};
