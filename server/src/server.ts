import { Model } from 'objection';
import koaBodyParser from 'koa-bodyparser';
import Koa from 'koa';
import userRouter from './api/users/users.routes';
import roadmapRouter from './api/roadmaps/roadmaps.routes';
import tasksRouter from './api/tasks/tasks.routes';
import taskratingRouter from './api/taskratings/taskratings.routes';
import Knex from 'knex';
import Dotenv from 'dotenv';
import knexConfig from '../knexfile';
import session from 'koa-session';
import passport from 'koa-passport';
import { setupAuth } from './utils/auth';
import { errorHandler } from './utils/errorhandler';
import cors from '@koa/cors';
Dotenv.config();

const createServer = async () => {
  console.log('Creating server');
  setupAuth();
  const app = new Koa();
  Model.knex(Knex(knexConfig));

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

  const port = process.env.SERVER_PORT;
  return app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
};

export const app = createServer();
