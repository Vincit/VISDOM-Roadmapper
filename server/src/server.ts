import cors from '@koa/cors';
import KoaRouter from '@koa/router';
import Dotenv from 'dotenv';
import Knex from 'knex';
import Koa, { Context, DefaultState } from 'koa';
import koaBodyParser from 'koa-bodyparser';
import passport from 'koa-passport';
import session from 'koa-session';
import { Model } from 'objection';
import knexConfig from '../knexfile';
import jiraRouter from './api/jira/jira.routes';
import jiraConfigurationRouter from './api/jiraconfigurations/jiraconfigurations.routes';
import roadmapRouter from './api/roadmaps/roadmaps.routes';
import userRouter from './api/users/users.routes';
import { setupAuth } from './utils/auth';
import { errorHandler } from './utils/errorhandler';

Dotenv.config();
export const knex = Knex(knexConfig);

const createServer = async () => {
  console.log('Creating server');
  setupAuth();
  const app = new Koa();
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
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(errorHandler);
  app.use(koaBodyParser());

  const rootRouter = new KoaRouter<DefaultState, Context>();
  rootRouter.use(userRouter.routes());
  rootRouter.use(userRouter.allowedMethods());
  rootRouter.use(roadmapRouter.routes());
  rootRouter.use(roadmapRouter.allowedMethods());
  rootRouter.use(jiraRouter.routes());
  rootRouter.use(jiraRouter.allowedMethods());
  rootRouter.use(jiraConfigurationRouter.routes());
  rootRouter.use(jiraConfigurationRouter.allowedMethods());
  rootRouter.get('/', (ctx, next) => {
    ctx.status = 200;
    ctx.body = '';
  });
  app.use(rootRouter.routes());
  app.use(rootRouter.allowedMethods());

  const port = process.env.SERVER_PORT;
  const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
  return server;
};

export const server = createServer();
