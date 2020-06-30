import cors from '@koa/cors';
import Dotenv from 'dotenv';
import Knex from 'knex';
import Koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import passport from 'koa-passport';
import session from 'koa-session';
import { Model } from 'objection';
import knexConfig from '../knexfile';
import roadmapRouter from './api/roadmaps/roadmaps.routes';
import taskratingRouter from './api/taskratings/taskratings.routes';
import tasksRouter from './api/tasks/tasks.routes';
import userRouter from './api/users/users.routes';
import versionsRouter from './api/versions/versions.routes';
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
  app.use(session({}, app));
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
  app.use(userRouter.routes());
  app.use(userRouter.allowedMethods());
  app.use(roadmapRouter.routes());
  app.use(roadmapRouter.allowedMethods());
  app.use(tasksRouter.routes());
  app.use(tasksRouter.allowedMethods());
  app.use(taskratingRouter.routes());
  app.use(taskratingRouter.allowedMethods());
  app.use(versionsRouter.routes());
  app.use(versionsRouter.allowedMethods());

  const port = process.env.SERVER_PORT;
  const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
  return server;
};

export const server = createServer();
