import { Context } from 'koa';

export const isCurrentUser = async (ctx: Context, next: () => Promise<any>) => {
  const user = ctx.state.user;
  const id = Number(ctx.params.id);
  if (user && id && user.id === id) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'No permission';
  }
};
