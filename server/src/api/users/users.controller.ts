import passport from 'passport';
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
  if (ctx.isAuthenticated()) {
    ctx.body = ctx.state.user;
  } else {
    ctx.status = 401;
  }
};

export const getHotSwappableUsers: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.isAuthenticated()) {
    ctx.status = 401;
    ctx.body = 'Authentication required';
    return;
  }
  const hotSwappableUsers = await User.relatedQuery('hotSwappableUsers').for(
    User.query().where('id', ctx.session!.originalUserId),
  );
  hotSwappableUsers.push(
    await User.query().where('id', ctx.session!.originalUserId).first(),
  );

  const idsAndNames = hotSwappableUsers.map((user) => {
    return {
      id: user.id,
      username: user.username,
    };
  });

  ctx.status = 200;
  ctx.body = idsAndNames;
  return;
};

export const hotswapUser: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.request.body.targetUser) {
    ctx.status = 400;
    ctx.body = 'targetUser must be specified';
    return;
  }
  const targetUserId = ctx.request.body.targetUser;

  if (targetUserId === ctx.state.user.id) {
    ctx.status = 400;
    ctx.body = 'Already logged in as given user';
    return;
  }

  //Verify that it is possible to hot swap to given user
  const hotSwappableUsers = await User.relatedQuery('hotSwappableUsers').for(
    User.query().where('id', ctx.session!.originalUserId),
  );
  hotSwappableUsers.push(
    await User.query().where('id', ctx.session!.originalUserId).first(),
  );

  const foundUser = hotSwappableUsers.find((user) => user.id === targetUserId);
  if (!foundUser) {
    ctx.status = 401;
    ctx.body = 'Hotswap to target user not allowed';
    return;
  }
  ctx.status = 200;
  return ctx.login(foundUser);
};
