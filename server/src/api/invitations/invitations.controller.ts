import { RouteHandlerFnc } from 'src/types/customTypes';
import Invitation from './invitations.model';
import User from '../users/users.model';
import uuid from 'uuid';
import { sendEmail } from '../../utils/sendEmail';
import { daysAgo } from '../../utils/date';

// should FRONTEND_BASE_URL and CORS_ORIGIN be same variable?
const BASE_URL = process.env.FRONTEND_BASE_URL!;

const deleteOldInvitations = () =>
  Invitation.query().delete().where('updatedAt', '<', daysAgo(30));

export const getInvitations: RouteHandlerFnc = async (ctx) => {
  ctx.body = await Invitation.query()
    .where({
      roadmapId: Number(ctx.params.roadmapId),
    })
    .where('updatedAt', '>=', daysAgo(30));
};

export const postInvitation: RouteHandlerFnc = async (ctx) => {
  await deleteOldInvitations();

  const { type, email, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const roadmapId = Number(ctx.params.roadmapId);

  const existingRole = await User.query()
    .withGraphJoined('roles')
    .where({ roadmapId, email })
    .first();

  if (existingRole) throw new Error('Invitee is already a team member');

  const created = await Invitation.query()
    .insertAndFetch({
      id: uuid.v4(),
      roadmapId,
      type,
      email,
    })
    .onConflict(['roadmapId', 'email'])
    .merge();
  await sendEmail(
    email,
    'Invitation to roadmap',
    `You have been invited to a roadmap, here is a link:\r\n${BASE_URL}/join/${created.id}`,
  );
  return void (ctx.body = created);
};

export const patchInvitation: RouteHandlerFnc = async (ctx) => {
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

export const deleteInvitation: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Invitation.query()
    .where({
      id: ctx.params.invitationId,
    })
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
