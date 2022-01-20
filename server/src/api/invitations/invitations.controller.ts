import { RouteHandlerFnc } from 'src/types/customTypes';
import Invitation from './invitations.model';
import User from '../users/users.model';
import Customer from '../customer/customer.model';
import uuid from 'uuid';
import { sendEmail } from '../../utils/sendEmail';
import { daysAgo } from '../../../../shared/utils/date';
import { hasPermission } from '../../../../shared/utils/permission';
import { Permission } from '../../../../shared/types/customTypes';
import { difference } from '../../utils/array';

// should FRONTEND_BASE_URL and CORS_ORIGIN be same variable?
const BASE_URL = process.env.FRONTEND_BASE_URL!;

const deleteOldInvitations = () =>
  Invitation.query().delete().where('updatedAt', '<', daysAgo(30));

export const getInvitations: RouteHandlerFnc = async (ctx) => {
  ctx.body = await Invitation.query()
    .withGraphFetched('representativeFor')
    .where({
      roadmapId: Number(ctx.params.roadmapId),
    })
    .where('updatedAt', '>=', daysAgo(30));
};

export const postInvitation: RouteHandlerFnc = async (ctx) => {
  await deleteOldInvitations();

  const { type, email, representativeFor, ...others } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);
  if (
    !hasPermission(type, Permission.CustomerRepresent) &&
    representativeFor?.length > 0
  )
    return void (ctx.status = 400);

  const roadmapId = Number(ctx.params.roadmapId);

  const existingRole = await User.query()
    .withGraphJoined('roles')
    .where({ roadmapId, email })
    .first();

  if (existingRole) throw new Error('Invitee is already a team member');

  const created = await Invitation.transaction(async (trx) => {
    const invitation = await Invitation.query(trx)
      .insertAndFetch({
        id: uuid.v4(),
        roadmapId,
        type,
        email,
      })
      .onConflict(['roadmapId', 'email'])
      .merge();

    if (representativeFor?.length > 0) {
      const customers = await Customer.query(trx)
        .whereIn('id', representativeFor)
        .andWhere('roadmapId', roadmapId);

      await invitation
        .$relatedQuery('representativeFor', trx)
        .relate(customers);
    }
    return invitation;
  });
  await sendEmail(
    email,
    'Invitation to roadmap',
    `You have been invited to a roadmap, here is a link:\r\n${BASE_URL}/join/${created.id}`,
  );
  return void (ctx.body = created);
};

export const patchInvitation: RouteHandlerFnc = async (ctx) => {
  const {
    id,
    type,
    email,
    roadmapId: _,
    representativeFor,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);
  const roadmapId = Number(ctx.params.roadmapId);

  const patched = await Invitation.transaction(async (trx) => {
    const invitation = await Invitation.query(trx).findById(
      ctx.params.invitationId,
    );
    if (!invitation) return false;

    const updated = await invitation
      .$query(trx)
      .patchAndFetch({ type, email })
      .withGraphFetched('representativeFor');

    if (!hasPermission(updated.type, Permission.CustomerRepresent)) {
      if (!updated.representativeFor.length) return updated;

      await updated.$relatedQuery('representativeFor', trx).unrelate();
      return await updated.$query(trx).withGraphFetched('representativeFor');
    }
    if (!representativeFor) return updated;

    const { added, removed } = difference(
      updated.representativeFor.map(({ id }) => id) || [],
      representativeFor || [],
    );

    if (removed.length) {
      await updated
        .$relatedQuery('representativeFor', trx)
        .whereIn('id', removed)
        .unrelate();
    }
    if (added.length) {
      const customers = await Customer.query(trx)
        .whereIn('id', added)
        .andWhere('roadmapId', roadmapId);
      await updated.$relatedQuery('representativeFor', trx).relate(customers);
    }
    return await updated.$query(trx).withGraphFetched('representativeFor');
  });

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
