import { requireAuth } from './../../utils/requireAuth';
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

userRouter.get('/users', requireAuth, getUsers);
userRouter.post('/users', requireAuth, postUsers);
userRouter.patch('/users/:id', requireAuth, patchUsers);
userRouter.delete('/users/:id', requireAuth, deleteUsers);

userRouter.post('/users/login', loginUser);
userRouter.get('/users/logout', logoutUser);
userRouter.get('/users/whoami', getCurrentUser);

export default userRouter;
