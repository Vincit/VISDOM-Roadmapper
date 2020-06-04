import { RouteHandlerFnc } from '../../types/customTypes';
import User from './users.model';
import passport from 'passport';
import { Context } from 'koa';

export const getUsers: RouteHandlerFnc = async (ctx, _) => {
  const query = User.query();

  if (ctx.query.select) {
    query.select(ctx.query.select);
  }

  if (ctx.query.username) {
    query.modify('searchByUsernamePartial', ctx.query.username);
  }

  if (ctx.query.orderby) {
    query.orderBy(ctx.query.orderby);
  }

  ctx.body = await query;
};

export const postUsers: RouteHandlerFnc = async (ctx, _) => {
  const inserted = await User.query().insert(ctx.request.body);

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

export const loginUser: RouteHandlerFnc = async (ctx, _) => {
  return passport.authenticate('local', (err, user, info, status) => {
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

export const logoutUser: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.status = 200;
  } else {
    ctx.status = 401;
  }
};

export const getCurrentUser: RouteHandlerFnc = async (ctx, _) => {
  if (ctx.isAuthenticated()) {
    const userCopy = { ...ctx.state.user };
    delete userCopy.password;
    ctx.body = userCopy;
  } else {
    ctx.status = 401;
  }
};
