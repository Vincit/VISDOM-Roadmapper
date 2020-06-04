import KoaRouter from '@koa/router';
import { Context, Next } from 'koa';

export interface RouteHandlerFnc {
  (ctx: Context, next: Next): Promise<void>;
}

export const enum TaskRatingDimension {
  BusinessValue = 0,
  RequiredWork = 1,
}
