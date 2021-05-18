import { RouteHandlerFnc, RoleType } from '../../types/customTypes';
import Roadmap from './roadmaps.model';
import User from '../users/users.model';
import { Role } from '../roles/roles.model';

export const getRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const query = User.relatedQuery('roadmaps').for(ctx.state.user.id);
  if (ctx.query.eager) {
    const eagerResult = await query.withGraphFetched(
      '[tasks.ratings, jiraconfiguration]',
    );
    ctx.body = eagerResult;
  } else {
    const eagerResult = await query.withGraphFetched('[tasks(selectTaskId)]');
    ctx.body = eagerResult;
  }
};

export const getRoadmapsUsers: RouteHandlerFnc = async (ctx, _) => {
  const users = await Roadmap.relatedQuery('users').for(ctx.params.roadmapId);
  ctx.body = users;
};

export const getCurrentUser: RouteHandlerFnc = async (ctx, _) => {
  const { password, authToken, ...userData } = ctx.state.user;
  ctx.body = {
    ...userData,
    role: RoleType[ctx.state.role],
  };
};

export const postRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  ctx.body = await Roadmap.transaction(async (trx) => {
    const roadmap = await Roadmap.query(trx).insertAndFetch(ctx.request.body);
    await Role.query(trx).insert({
      userId: ctx.state.user.id,
      roadmapId: roadmap.id,
      type: RoleType.Admin,
    });
    return roadmap;
  });
};

export const patchRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const { name, description, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await Roadmap.query().patchAndFetchById(
    ctx.params.roadmapId,
    { name: name, description: description },
  );

  if (!updated) {
    return void (ctx.status = 404);
  } else {
    return void (ctx.body = updated);
  }
};

export const deleteRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Roadmap.query()
    .findById(ctx.params.roadmapId)
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
