import { Context } from 'koa';
import passport from 'koa-passport';
import {
  ValidationError,
  UniqueViolationError,
  ForeignKeyViolationError,
  NotNullViolationError,
} from 'objection';

export const requireAuth = async (ctx: Context, next: () => Promise<any>) => {
  return passport.authenticate('authtoken', async (_err, user, _info) => {
    if (user || ctx.isAuthenticated()) {
      ctx.state.user = user || ctx.state.user;
      await next();
    } else {
      ctx.status = 401;
      ctx.body = 'Authentication required';
    }
  })(ctx, next);
};
