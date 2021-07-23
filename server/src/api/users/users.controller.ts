import passport from 'passport';
import uuid from 'uuid';
import { RouteHandlerFnc } from '../../types/customTypes';
import User from './users.model';

export const getUsers: RouteHandlerFnc = async (ctx) => {
  const query = User.query();
  query.select('id', 'username', 'type');
  ctx.body = await query;
};

export const postUsers: RouteHandlerFnc = async (ctx) => {
  const { id, ...others } = ctx.request.body;
  const inserted = await User.query().insertAndFetch(others);

  ctx.body = inserted;
};

export const patchUsers: RouteHandlerFnc = async (ctx) => {
  const { id, username, email, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await User.query().patchAndFetchById(ctx.params.id, {
    username: username,
    email: email,
  });
  if (!updated) {
    return void (ctx.status = 404);
  } else {
    return void (ctx.body = updated);
  }
};

export const deleteUsers: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await User.query().findById(ctx.params.id).delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};

export const registerUser: RouteHandlerFnc = async (ctx) => {
  // keep only required fields
  const request = User.jsonSchema.required.reduce(
    (object, key) => ({ ...object, [key]: ctx.request.body[key] }),
    {},
  );

  const user = await User.query()
    .insertAndFetch(request)
    .withGraphFetched('[representativeFor, roles]');
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
      ctx.body = { message: 'Incorrect username or password.' };
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
