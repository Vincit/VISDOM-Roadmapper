import { RouteHandlerFnc } from '../../types/customTypes';
import { RoleType } from '../../../../shared/types/customTypes';
import Roadmap from './roadmaps.model';
import User from '../users/users.model';
import { Role } from '../roles/roles.model';

export const getRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }

  const query = User.relatedQuery('roadmaps').for(ctx.state.user.id);
  if (ctx.query.eager) {
    const eagerResult = await query.withGraphFetched(
      '[tasks.ratings, integrations]',
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
  // Stringify user once here to run it through the objection model stringify method
  // Using the spread operator will not remove fields that are not to be sent
  const cleanUser = JSON.parse(JSON.stringify(ctx.state.user));
  cleanUser.roleType = RoleType[ctx.state.role];
  ctx.body = cleanUser;
};

export const postRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  if (!ctx.state.user) {
    throw new Error('User is required');
  }

  ctx.body = await Roadmap.transaction(async (trx) => {
    const roadmap = await Roadmap.query(trx).insertAndFetch(ctx.request.body);
    await Role.query(trx).insert({
      userId: ctx.state.user!.id,
      roadmapId: roadmap.id,
      type: RoleType.Admin,
    });
    return roadmap;
  });
};

export const patchRoadmaps: RouteHandlerFnc = async (ctx, _) => {
  const { id, name, description, ...others } = ctx.request.body;
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
