import passport from 'passport';
import { UniqueViolationError } from 'objection';
import uuid from 'uuid';
import { RouteHandlerFnc } from '../../types/customTypes';
import User from './users.model';

export const getUsers: RouteHandlerFnc = async (ctx, _) => {
  const query = User.query();
  query.select('id', 'username', 'type', 'customerValue');
  ctx.body = await query;
};

export const postUsers: RouteHandlerFnc = async (ctx, _) => {
  const inserted = await User.query().insertAndFetch(ctx.request.body);

  ctx.body = inserted;
};

export const patchUsers: RouteHandlerFnc = async (ctx, _) => {
  const updated = await User.query().patchAndFetchById(
    ctx.params.id,
    ctx.request.body,
  );
  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};

export const deleteUsers: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await User.query().findById(ctx.params.id).delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const registerUser: RouteHandlerFnc = async (ctx, _) => {
  // keep only required fields
  const request = User.jsonSchema.required.reduce(
    (object, key) => ({ ...object, [key]: ctx.request.body[key] }),
    {},
  );

  const user = await User.query().insertAndFetch(request);
  ctx.body = user;
  ctx.status = 200;
};

const setToken = (userId: number, authToken: string | null) =>
  User.query().patchAndFetchById(userId, { authToken });

export const generateToken: RouteHandlerFnc = async (ctx, _) => {
  const updated = await setToken(ctx.state.user.id, uuid.v4());
  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated.authToken;
  }
};

export const getToken: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = ctx.state.user.authToken;
};

export const deleteToken: RouteHandlerFnc = async (ctx, _) => {
  const updated = await setToken(ctx.state.user.id, null);
  delete ctx.state.user.authToken;
  ctx.status = updated ? 200 : 404;
};

export const loginUser: RouteHandlerFnc = async (ctx, _) => {
  return passport.authenticate('local', (err, user, info, status) => {
    if (user === false) {
      ctx.body = { message: 'Incorrect username or password.' };
      ctx.status = 401;
      return;
    } else {
      ctx.status = 200;

      // Store id of user for user hot swap feature
      ctx.session!.originalUserId = user.id;
      return ctx.login(user);
    }
  })(ctx);
};

export const logoutUser: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.session && ctx.session.originalUserId) {
    // Remove field so hot-swap cannot be used after logout
    delete ctx.session.originalUserId;
  }

  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.status = 200;
  } else {
    ctx.status = 401;
  }
};

export const getCurrentUser: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = ctx.state.user;
};

export const getUserRoles: RouteHandlerFnc = async (ctx, _) => {
  const roles = await User.relatedQuery('roles').for(ctx.state.user.id);
  ctx.body = roles;
};
