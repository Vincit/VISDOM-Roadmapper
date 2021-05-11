import { Context } from 'koa';

export const forbidden = async (ctx: Context) => {
  ctx.status = 403;
  ctx.body = 'No permission';
};
