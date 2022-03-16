import { RouteHandlerFnc } from 'src/types/customTypes';
import Invitation from './invitations.model';
import User from '../users/users.model';
import Customer from '../customer/customer.model';
import Roadmap from '../roadmaps/roadmaps.model';
import uuid from 'uuid';
import { sendEmail } from '../../utils/sendEmail';
import { daysAgo } from '../../../../shared/utils/date';
import { hasPermission } from '../../../../shared/utils/permission';
import { Permission, RoleType } from '../../../../shared/types/customTypes';
import { difference } from '../../utils/array';
import { isOptional, isNumberArray } from '../../utils/typeValidation';
import { projectInvitationEmail } from '../../utils/emailMessages';

// should FRONTEND_BASE_URL and CORS_ORIGIN be same variable?
const BASE_URL = process.env.FRONTEND_BASE_URL!;

export const sendInvitations = (
  invitations: Invitation[],
  roadmapName: string,
) =>
  Promise.all(
    invitations.map(({ email, id, type }) =>
      sendEmail(
        email,
        'Invitation to roadmap',
        `You have been invited to a roadmap, here is a link:\r\n${BASE_URL}/join/${id}`,
        projectInvitationEmail(
          BASE_URL,
          id,
          roadmapName,
          RoleType[type] === RoleType[RoleType.Business]
            ? 'Sales representative'
            : RoleType[type],
        ),
      ),
    ),
  );

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
  if (!isOptional(isNumberArray)(representativeFor))
    return void (ctx.status = 400);

  if (!hasPermission(type, Permission.CustomerRepresent) && representativeFor)
    return void (ctx.status = 400);

  const roadmapId = Number(ctx.params.roadmapId);

  const existingRole = await User.query()
    .withGraphJoined('roles')
    .where({ roadmapId, email })
    .first();

  if (existingRole) throw new Error('Invitee is already a team member');

  let customers: Customer[] = [];
  if (representativeFor?.length) {
    customers = await Customer.query()
      .whereIn('id', representativeFor)
      .andWhere('roadmapId', roadmapId);

    if (customers.length !== representativeFor.length)
      return void (ctx.status = 404);
  }

  const [created, roadmap] = await Invitation.transaction(async (trx) => {
    const invitation = await Invitation.query(trx)
      .insertAndFetch({
        id: uuid.v4(),
        roadmapId,
        type,
        email,
      })
      .onConflict(['roadmapId', 'email'])
      .merge();

    if (customers.length)
      await invitation
        .$relatedQuery('representativeFor', trx)
        .relate(customers);
    const roadmap = await Roadmap.query()
      .findById(ctx.params.roadmapId)
      .throwIfNotFound();
    return [invitation, roadmap];
  });

  await sendInvitations([created], roadmap.name);
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
  if (!isOptional(isNumberArray)(representativeFor))
    return void (ctx.status = 400);

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
      if (!updated.representativeFor!.length) return updated;

      await updated.$relatedQuery('representativeFor', trx).unrelate();
      return await updated.$query(trx).withGraphFetched('representativeFor');
    }
    if (!representativeFor) return updated;

    const { added, removed } = difference(
      updated.representativeFor!.map(({ id }) => id),
      representativeFor,
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

  ctx.status = numDeleted === 1 ? 200 : 404;
};
