import {
  ServerEventsMap,
  ClientEventsMap,
} from './../../../shared/types/sockettypes';
import { RoleType } from './../../../shared/types/customTypes';
import { Server, Socket } from 'socket.io';
import { Context } from 'koa';
import User from 'src/api/users/users.model';
import KoaRouter from '@koa/router';
import Koa from 'koa';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface IKoaState {
  user?: User;
  role?: RoleType;
}

export interface ISocketData {
  user: Pick<User, 'id'>;
}

export interface IExtendedKoaContext extends Koa.DefaultContext {
  io?: Server;
}

export type IKoaContext = Context | IExtendedKoaContext;

export type RouteHandlerFnc = KoaRouter.Middleware<IKoaState, IKoaContext>;

export type ExtendedServer = Server<
  ServerEventsMap,
  ClientEventsMap,
  DefaultEventsMap,
  ISocketData
>;

export type ExtendedSocket = Socket<
  ServerEventsMap,
  ClientEventsMap,
  DefaultEventsMap,
  ISocketData
>;
