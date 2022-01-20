import passport from 'passport';
import uuid from 'uuid';
import { RouteHandlerFnc } from '../../types/customTypes';
import User from './users.model';
import Invitation from '../invitations/invitations.model';
import EmailVerification from '../emailVerification/emailVerification.model';
import PasswordReset from '../passwordReset/passwordReset.model';
import { sendVerificationLink } from '../emailVerification/emailVerification.controller';
import { Role } from '../roles/roles.model';
import { sendEmail } from '../../utils/sendEmail';
import { daysAgo } from '../../../../shared/utils/date';

export const getUsers: RouteHandlerFnc = async (ctx) => {
  const query = User.query();
  query.select('id', 'email', 'type');
  ctx.body = await query;
};

export const postUsers: RouteHandlerFnc = async (ctx) => {
  const { id, emailVerified, ...others } = ctx.request.body;
  const inserted = await User.query().insertAndFetch(others);

  ctx.body = inserted;
};

export const patchUsers: RouteHandlerFnc = async (ctx) => {
  const {
    id,
    email,
    emailVerified,
    defaultRoadmapId,
    currentPassword,
    password,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  let status = 500;

  const updated = await User.transaction(async (trx) => {
    const previous = await User.query(trx).findById(ctx.params.id);
    if (!previous) {
      status = 404;
      return null;
    }
    if (!(await previous.verifyPassword(currentPassword))) {
      status = 400;
      return null;
    }
    const emailVerified =
      email === undefined || email === previous.email
        ? previous.emailVerified
        : false;
    return await previous.$query(trx).patchAndFetch({
      email,
      emailVerified,
      defaultRoadmapId,
      password,
    });
  });
  if (!updated) {
    return void (ctx.status = status);
  } else {
    if (!updated.emailVerified) {
      await sendVerificationLink(updated.id, updated.email);
    }
    return void (ctx.body = updated);
  }
};

export const sendNewVerificationLink: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');

  const { id, email } = ctx.state.user;
  const ok = await sendVerificationLink(id, email);
  ctx.status = ok ? 200 : 500;
};

export const deleteUsers: RouteHandlerFnc = async (ctx) => {
  const { currentPassword } = ctx.request.body;
  ctx.status = await User.transaction(async (trx) => {
    const user = await User.query(trx).findById(ctx.params.id);

    if (!user) return 404;
    if (!(await user.verifyPassword(currentPassword))) return 400;

    const numDeleted = await user.$query(trx).delete();
    return numDeleted == 1 ? 200 : 500;
  });
};

export const registerUser: RouteHandlerFnc = async (ctx) => {
  // keep only required fields
  const request = User.jsonSchema.required.reduce(
    (object, key) => ({ ...object, [key]: ctx.request.body[key] }),
    {},
  );

  const { id, email } = await User.query().insertAndFetch(request);
  await sendVerificationLink(id, email);
  const user = await User.query()
    .findById(id)
    .withGraphFetched('[representativeFor, roles, emailVerificationLink]');
  await ctx.login(user);
  ctx.body = user;
  ctx.status = 200;
};

const setToken = (userId: number, authToken: string | null) =>
  User.query().patchAndFetchById(userId, { authToken });

export const generateToken: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const updated = await setToken(ctx.state.user.id, uuid.v4());
  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated.authToken;
  }
};

export const getToken: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  ctx.body = ctx.state.user.authToken;
};

export const deleteToken: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const updated = await setToken(ctx.state.user.id, null);
  ctx.state.user.authToken = null;
  ctx.status = updated ? 200 : 404;
};

export const loginUser: RouteHandlerFnc = async (ctx) => {
  return passport.authenticate('local', (_err, user) => {
    if (user === false) {
      ctx.body = { message: 'Incorrect email or password.' };
      ctx.status = 401;
      return;
    } else {
      ctx.status = 200;
      return ctx.login(user);
    }
  })(ctx);
};

export const logoutUser: RouteHandlerFnc = async (ctx) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.status = 200;
  } else {
    ctx.status = 401;
  }
};

// TODO: same as in roadmap router
export const getCurrentUser: RouteHandlerFnc = async (ctx) => {
  ctx.body = ctx.state.user;
};

export const getUserRoles: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }
  const roles = await User.relatedQuery('roles').for(ctx.state.user.id);
  ctx.body = roles;
};

export const getInvitation: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');

  const invitation = await Invitation.query()
    .findById(ctx.params.invitationId)
    .withGraphFetched('roadmap');

  if (!invitation || !invitation.valid) return void (ctx.status = 404);
  if (invitation.email !== ctx.state.user.email) return void (ctx.status = 403);

  await User.query().findById(ctx.state.user.id).patch({ emailVerified: true });

  return void (ctx.body = invitation);
};

export const joinRoadmap: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  const { ...others } = ctx.request.body;
  const userId = Number(ctx.params.userId);

  const invitation = await Invitation.query()
    .withGraphFetched('representativeFor')
    .findById(ctx.params.invitationId);

  if (Object.keys(others).length || !invitation || !invitation.valid)
    return void (ctx.status = 400);
  if (invitation.email !== ctx.state.user.email) return void (ctx.status = 403);

  const role = await Invitation.transaction(async (trx) => {
    await invitation.$query(trx).delete();

    if (invitation.representativeFor.length > 0)
      await User.relatedQuery('representativeFor', trx)
        .for(userId)
        .relate(invitation.representativeFor);

    return await Role.query(trx).insertAndFetch({
      userId,
      roadmapId: invitation.roadmapId,
      type: invitation.type,
    });
  });
  return void (ctx.body = role);
};

export const verifyEmail: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  if (Object.keys(ctx.request.body).length) {
    ctx.status = 400;
    return;
  }

  const verification = await EmailVerification.query()
    .findById(ctx.state.user.id)
    .where({
      uuid: ctx.params.verificationId,
      email: ctx.state.user.email,
    });

  if (!verification) {
    ctx.status = 404;
    return;
  }

  if (!verification.valid) {
    ctx.status = 400;
    ctx.body = 'Verification link has expired';
    return;
  }

  await User.query()
    .findById(verification.userId)
    .where({ email: verification.email })
    .patch({ emailVerified: true });
  await verification.$query().delete();
  ctx.status = 200;
};

const BASE_URL = process.env.FRONTEND_BASE_URL!;

export const sendPasswordResetLink: RouteHandlerFnc = async (ctx) => {
  const { email, ...rest } = ctx.request.body;
  if (Object.keys(rest).length) {
    ctx.status = 400;
    return;
  }

  // clean up expired links
  await PasswordReset.query()
    .delete()
    .where('updatedAt', '<', daysAgo(PasswordReset.linkExpirationDays * 2));

  ctx.status = await User.transaction(async (trx) => {
    const user = await User.query(trx).where({ email }).first();
    if (!user) return 404;
    const created = await PasswordReset.query(trx)
      .insertAndFetch({ userId: user.id, uuid: uuid.v4(), updatedAt: 'now' })
      .onConflict('userId')
      .merge();
    if (!created) return 500;
    await sendEmail(
      email,
      'Reset your password',
      `Please reset your password using the link:\r\n${BASE_URL}/resetPassword/${created.uuid}`,
    );
    return 200;
  });
};

export const resetPassword: RouteHandlerFnc = async (ctx) => {
  const { token, password, ...rest } = ctx.request.body;
  if (Object.keys(rest).length) {
    ctx.status = 400;
    return;
  }
  ctx.status = await User.transaction(async (trx) => {
    const found = await PasswordReset.query(trx).where({ uuid: token }).first();
    if (!found) return 404;
    if (!found.valid) {
      ctx.body = 'Password reset link has expired';
      return 400;
    }
    const user = await User.query(trx).findById(found.userId);
    if (!user) return 404;
    await user.$query(trx).patch({ password });
    await found.$query(trx).delete();
    return 200;
  });
};
