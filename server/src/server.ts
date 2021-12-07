import { validateEnv } from './utils/validateEnv';
import cors from '@koa/cors';
import KoaRouter from '@koa/router';
import Dotenv from 'dotenv';
import Knex from 'knex';
import Koa, { Context } from 'koa';
import koaBodyParser from 'koa-bodyparser';
import passport from 'koa-passport';
import session from 'koa-session';
import { Model } from 'objection';
import knexConfig from '../knexfile';
import roadmapRouter from './api/roadmaps/roadmaps.routes';
import userRouter from './api/users/users.routes';
import { setupAuth } from './utils/auth';
import { errorHandler } from './utils/errorhandler';
import { IKoaState } from './types/customTypes';

Dotenv.config();
if (!validateEnv()) {
  throw new Error('Invalid environment variables');
}

export const knex = Knex(knexConfig);

const createServer = async () => {
  console.log('Creating server');
  setupAuth();
  const app = new Koa<Koa.DefaultState, Koa.DefaultContext>();
  Model.knex(knex);

  app.keys = [process.env.SESSION_SECRET!];
  app.proxy = process.env.NODE_ENV === 'production'; // Trust load balancer
  app.use(
    session(
      process.env.NODE_ENV === 'production'
        ? {
            sameSite: 'none',
            secure: true,
            signed: true,
          }
        : {},
      app,
    ),
  );
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN!,
      credentials: true,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(errorHandler);
  app.use(koaBodyParser());

  const rootRouter = new KoaRouter<IKoaState, Context>();
  rootRouter.get('/', (ctx) => {
    ctx.status = 200;
    ctx.body = '';
  });
  rootRouter.use(userRouter.routes());
  rootRouter.use(userRouter.allowedMethods());
  rootRouter.use(roadmapRouter.routes());
  rootRouter.use(roadmapRouter.allowedMethods());
  app.use(rootRouter.routes());
  app.use(rootRouter.allowedMethods());

  const port = Number(process.env.SERVER_PORT);
  const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
  return server;
};

export const server = createServer();
