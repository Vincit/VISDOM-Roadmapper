import { RouteHandlerFnc } from 'src/types/customTypes';
import Invitation from './invitations.model';
import User from '../users/users.model';
import uuid from 'uuid';

export const addInvitations: RouteHandlerFnc = async (ctx) => {
  const { type, email, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const roadmapId = Number(ctx.params.roadmapId);

  const existingRole = await User.query()
    .withGraphJoined('roles')
    .where({ roadmapId, email })
    .first();

  if (existingRole) throw new Error('Invitee is already a team member');

  const previousInvitation = await Invitation.query()
    .where({ email, roadmapId })
    .first();

  if (previousInvitation) {
    const updated = await Invitation.query().patchAndFetchById(
      previousInvitation.id,
      { type },
    );
    return void (ctx.body = updated);
  }

  const created = await Invitation.query().insertAndFetch({
    id: uuid.v4(),
    roadmapId,
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
