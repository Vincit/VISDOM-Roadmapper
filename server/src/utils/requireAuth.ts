import { Context } from 'koa';
import passport from 'koa-passport';

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

export const requireLoginSession = async (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const user = ctx.state.user;
  const session = ctx.session?.passport;
  if (user && session && user.id === session.user) {
    await next();
  } else {
    ctx.status = 401;
    ctx.body = 'Login session required';
  }
};
