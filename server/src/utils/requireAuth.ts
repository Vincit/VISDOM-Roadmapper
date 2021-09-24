import passport from 'koa-passport';
import { RouteHandlerFnc } from '../types/customTypes';

export const requireAuth: RouteHandlerFnc = async (ctx, next) => {
  return passport.authenticate('authtoken', async (_err, user) => {
    if (user || ctx.isAuthenticated()) {
      ctx.state.user = user || ctx.state.user;
      await next();
    } else {
      ctx.status = 401;
      ctx.body = 'Authentication required';
    }
  })(ctx, next);
};

export const requireVerifiedEmail: RouteHandlerFnc = async (ctx, next) => {
  if (!ctx.state.user) throw new Error('User is required');
  if (ctx.state.user.emailVerified) return next();
  ctx.status = 403;
  ctx.body = 'Verified email required';
};
