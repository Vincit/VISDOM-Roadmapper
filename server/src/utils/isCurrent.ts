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

export const isCurrentRoadmap = async (
  ctx: Context,
  next: () => Promise<any>,
) => {
  const body = ctx.request.body;
  const id = Number(ctx.params.roadmapId);
  if (!body.roadmapId || (id && body.roadmapId === id)) {
    await next();
  } else {
    ctx.status = 403;
    ctx.body = 'No permission';
  }
};
