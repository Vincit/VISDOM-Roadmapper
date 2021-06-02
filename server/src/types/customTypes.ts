import { Context } from 'koa';
import User from 'src/api/users/users.model';
import KoaRouter from '@koa/router';

export type RouteHandlerFnc = KoaRouter.Middleware<IKoaState, Context>;

export interface IKoaState {
  user?: User;
}
