import { RouteHandlerFnc } from 'src/types/customTypes';
import { Role } from './roles.model';

export const inviteRoadmapUser: RouteHandlerFnc = async (ctx) => {
  const created = await Role.query().insertAndFetch({
    type: ctx.request.body.type,
    userId: ctx.request.body.userId,
    roadmapId: Number(ctx.params.roadmapId),
  });
  ctx.body = created;
};

export const patchRoadmapUserRoles: RouteHandlerFnc = async (ctx) => {
  const { id, type, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const patched = await Role.query().patchAndFetchById(
    [Number(ctx.params.userId), Number(ctx.params.roadmapId)],
    { type: type },
  );

  if (patched) {
    return void (ctx.body = patched);
  } else {
    return void (ctx.status = 404);
  }
};

export const deleteRoadmapUserRoles: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Role.query()
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      userId: Number(ctx.params.userId),
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
