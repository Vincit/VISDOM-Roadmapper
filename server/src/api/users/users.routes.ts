import KoaRouter from '@koa/router';
import {
  getUsers,
  postUsers,
  patchUsers,
  deleteUsers,
  loginUser,
  getCurrentUser,
  logoutUser,
} from './users.controller';
import { DefaultState, Context } from 'koa';

const userRouter = new KoaRouter<DefaultState, Context>();

userRouter.get('/users', getUsers);
userRouter.post('/users', postUsers);
userRouter.patch('/users/:id', patchUsers);
userRouter.delete('/users/:id', deleteUsers);

userRouter.post('/users/login', loginUser);
userRouter.get('/users/logout', logoutUser);
userRouter.get('/users/whoami', getCurrentUser);

export default userRouter;
