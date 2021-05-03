import { requireAuth, requireLoginSession } from './../../utils/requireAuth';
import KoaRouter from '@koa/router';
import {
  getUsers,
  getUserRoles,
  postUsers,
  patchUsers,
  deleteUsers,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getHotSwappableUsers,
  hotswapUser,
} from './users.controller';
import { DefaultState, Context } from 'koa';

const userRouter = new KoaRouter<DefaultState, Context>();

userRouter.get('/users', requireAuth, getUsers);
userRouter.post('/users', requireAuth, postUsers);
userRouter.patch('/users/:id', requireAuth, patchUsers);
userRouter.delete('/users/:id', requireAuth, deleteUsers);

userRouter.post('/users/register', registerUser);
userRouter.post('/users/login', loginUser);
userRouter.get('/users/logout', logoutUser);
userRouter.get('/users/whoami', requireAuth, getCurrentUser);
userRouter.get('/users/roles', requireAuth, getUserRoles);
userRouter.get(
  '/users/hotswappableusers',
  requireAuth,
  requireLoginSession,
  getHotSwappableUsers,
);
userRouter.post(
  '/users/hotswap',
  requireAuth,
  requireLoginSession,
  hotswapUser,
);

export default userRouter;
