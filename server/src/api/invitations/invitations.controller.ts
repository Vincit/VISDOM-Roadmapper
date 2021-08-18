import { RouteHandlerFnc } from 'src/types/customTypes';
import Invitation from './invitations.model';
import uuid from 'uuid';

export const addInvitations: RouteHandlerFnc = async (ctx) => {
  const { type, email, roadmapId, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const created = await Invitation.query().insertAndFetch({
    id: uuid.v4(),
    roadmapId: Number(ctx.params.roadmapId),
    type,
    email,
  });
  return void (ctx.body = created);
};

export const patchInvitations: RouteHandlerFnc = async (ctx) => {
  const { id, type, email, roadmapId, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const patched = await Invitation.query().patchAndFetchById(
    ctx.params.invitationId,
    { type, email },
  );

  if (patched) {
    return void (ctx.body = patched);
  } else {
    return void (ctx.status = 404);
  }
};

export const deleteInvitations: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Invitation.query()
    .where({
      id: ctx.params.invitationId,
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
