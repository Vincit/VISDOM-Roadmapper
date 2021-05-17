import { RoleType } from './../../types/customTypes';
import { RouteHandlerFnc } from 'src/types/customTypes';
import { Role } from './roles.model';

export const inviteRoadmapUser: RouteHandlerFnc = async (ctx, _) => {
  const created = await Role.query().insertAndFetch({
    ...ctx.request.body,
    roadmapId: Number(ctx.params.roadmapId),
  });
  ctx.body = created;
};

export const patchRoadmapUserRoles: RouteHandlerFnc = async (ctx, _) => {
  const patched = await Role.query().patchAndFetchById(
    [Number(ctx.params.userId), Number(ctx.params.roadmapId)],
    {
      type: Number(ctx.request.body.type),
    },
  );

  if (patched) {
    ctx.body = patched;
  } else {
    ctx.status = 404;
  }
};

export const deleteRoadmapUserRoles: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Role.query()
    .where({
      roadmapId: Number(ctx.params.roadmapId),
      userId: Number(ctx.params.userId),
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
