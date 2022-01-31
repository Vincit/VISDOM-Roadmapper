import { RoleType } from './../../../shared/types/customTypes';
import { Server } from 'socket.io';
import { Context } from 'koa';
import User from 'src/api/users/users.model';
import KoaRouter from '@koa/router';
import Koa from 'koa';

export interface IKoaState {
  user?: User;
  role?: RoleType;
}

export interface IExtendedKoaContext extends Koa.DefaultContext {
  io?: Server;
}

export type IKoaContext = Context | IExtendedKoaContext;

export type RouteHandlerFnc = KoaRouter.Middleware<IKoaState, IKoaContext>;
