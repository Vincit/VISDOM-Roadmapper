import { Context } from 'koa';
import {
  ValidationError,
  UniqueViolationError,
  ForeignKeyViolationError,
  NotNullViolationError,
} from 'objection';

export const requireAuth = async (ctx: Context, next: () => Promise<any>) => {
  if (!ctx.isAuthenticated()) {
    ctx.status = 401;
    ctx.body = 'Authentication required';
  } else {
    await next();
  }
};
