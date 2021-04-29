import { Context } from 'koa';
import { Role } from '../api/roles/roles.model';

export const requireRole = async (ctx: Context, next: () => Promise<any>) => {
  const user = ctx.state.user.id;
  const roadmap = ctx.params.id;
  const role = await Role.query().findById([user, roadmap]);
  if (role) {
    ctx.state.role = role.type;
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'Role required';
  }
};

export const requirePermission = (permission: number) => (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const check = async () => {
    if (hasPermission(ctx.state.role, permission)) {
      await next();
    } else {
      ctx.status = 403;
      ctx.body = 'No permission';
    }
  };
  return ctx.state.role === undefined ? requireRole(ctx, check) : check();
};

export const hasPermission = (role: number, permission: number) => {
  return (role & permission) === permission;
};
