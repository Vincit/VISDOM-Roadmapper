import { requireAuth } from './../../utils/requireAuth';
import { forbidden } from '../../utils/forbidden';
import { isCurrentUser } from '../../utils/isCurrent';
import KoaRouter from '@koa/router';
import {
  getUsers,
  getUserRoles,
  postUsers,
  patchUsers,
  deleteUsers,
  registerUser,
  getToken,
  generateToken,
  deleteToken,
  loginUser,
  getCurrentUser,
  logoutUser,
  joinRoadmap,
  verifyEmail,
} from './users.controller';
import { Context } from 'koa';
import { IKoaState } from 'src/types/customTypes';

const userRouter = new KoaRouter<IKoaState, Context>();

userRouter.get('/users/mytoken', requireAuth, getToken);
userRouter.post('/users/mytoken', requireAuth, generateToken);
userRouter.delete('/users/mytoken', requireAuth, deleteToken);

userRouter.get('/users', requireAuth, forbidden, getUsers);
userRouter.post('/users', requireAuth, forbidden, postUsers);
userRouter.patch('/users/:id', requireAuth, isCurrentUser, patchUsers);
userRouter.delete('/users/:id', requireAuth, isCurrentUser, deleteUsers);

userRouter.post('/users/register', registerUser);
userRouter.post('/users/login', loginUser);
userRouter.get('/users/logout', logoutUser);
userRouter.get('/users/whoami', requireAuth, getCurrentUser);
userRouter.get('/users/roles', requireAuth, getUserRoles);
userRouter.post('/users/:userId/join/:invitationId', requireAuth, joinRoadmap);
userRouter.post(
  '/users/:userId/verifyEmail/:verificationId',
  requireAuth,
  verifyEmail,
);

export default userRouter;
