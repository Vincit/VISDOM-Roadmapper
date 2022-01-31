import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Koa from 'koa';
import http from 'http';
import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { IKoaState } from 'src/types/customTypes';

export const socketIoAuth = (
  app: Koa<IKoaState, Koa.DefaultContext>,
  passportMiddleware: Koa.Middleware,
  sessionMiddleware: Koa.Middleware,
) => {
  return (
    socket: Socket<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      IKoaState
    >,
    next: (err?: ExtendedError | undefined) => void,
  ) => {
    // Create a new (fake) Koa context to decrypt the session cookie using koa middleware
    let ctx = app.createContext<IKoaState>(
      socket.request,
      new http.ServerResponse(socket.request),
    );
    passportMiddleware(ctx, async () => {
      sessionMiddleware(ctx, async () => {
        socket.data = ctx.state;
        if (!socket.data.user) {
          const socketError: ExtendedError = new Error('Unauthenticated');
          return next(socketError);
        }
        next();
      });
    });
  };
};
