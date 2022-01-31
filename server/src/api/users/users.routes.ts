import { requireAuth, requireVerifiedEmail } from './../../utils/requireAuth';
import { isCurrentUser } from '../../utils/isCurrent';
import KoaRouter from '@koa/router';
import {
  getUserRoles,
  patchUsers,
  deleteUsers,
  registerUser,
  getToken,
  generateToken,
  deleteToken,
  loginUser,
  getCurrentUser,
  logoutUser,
  getInvitation,
  joinRoadmap,
  verifyEmail,
  sendNewVerificationLink,
  sendPasswordResetLink,
  resetPassword,
} from './users.controller';
import { IKoaContext, IKoaState } from 'src/types/customTypes';

const userRouter = new KoaRouter<IKoaState, IKoaContext>({
  prefix: '/users',
});

userRouter.get('/mytoken', requireAuth, requireVerifiedEmail, getToken);
userRouter.post('/mytoken', requireAuth, requireVerifiedEmail, generateToken);
userRouter.delete('/mytoken', requireAuth, requireVerifiedEmail, deleteToken);

userRouter.patch('/:id', requireAuth, isCurrentUser, patchUsers);
userRouter.delete('/:id', requireAuth, isCurrentUser, deleteUsers);

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/logout', logoutUser);
userRouter.get('/whoami', requireAuth, getCurrentUser);
userRouter.get('/roles', requireAuth, getUserRoles);
userRouter.get('/join/:invitationId', requireAuth, getInvitation);
userRouter.post('/:userId/join/:invitationId', requireAuth, joinRoadmap);
userRouter.post(
  '/:userId/verifyEmail/:verificationId',
  requireAuth,
  verifyEmail,
);
userRouter.post(
  '/:userId/sendEmailVerificationLink/',
  requireAuth,
  sendNewVerificationLink,
);

userRouter.post('/sendPasswordResetLink/', sendPasswordResetLink);
userRouter.post('/resetPassword/', resetPassword);

export default userRouter;
