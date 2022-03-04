import { ClientEvents } from './../../../../shared/types/sockettypes';
import { emitRoadmapEvent } from './../../utils/socketIoUtils';
import { RouteHandlerFnc } from '../../types/customTypes';
import { Permission, RoleType } from '../../../../shared/types/customTypes';
import Roadmap from './roadmaps.model';
import User from '../users/users.model';
import { Role } from '../roles/roles.model';
import Customer from '../customer/customer.model';
import Invitation from '../invitations/invitations.model';
import { sendInvitations } from '../invitations/invitations.controller';
import uuid from 'uuid';

export const getRoadmaps: RouteHandlerFnc = async (ctx) => {
  const { user } = ctx.state;
  if (!user) {
    throw new Error('User is required');
  }

  const query = User.relatedQuery('roadmaps').for(user.id);
  if (ctx.query.eager) {
    query.withGraphFetched('[integrations]');
  }
  ctx.body = await query;
};

export const getRoadmapsUsers: RouteHandlerFnc = async (ctx) => {
  const { user, role } = ctx.state;
  const { roadmapId } = ctx.params;
  if (!user || !role) throw new Error('User and role are required');

  const users = (await Roadmap.relatedQuery('users')
    .for(roadmapId)
    .withGraphFetched('representativeFor')
    .modifyGraph('representativeFor', (builder) => {
      builder.where('roadmapId', roadmapId).select('id');
    })) as User[] | undefined;

  ctx.body = users
    ?.filter((roadmapUser) =>
      roadmapUser.visibleFor(user, role, Number(roadmapId)),
    )
    .map(({ id, email, type }) => ({ id, email, type }));
};

export const postRoadmaps: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  const userInfo = ctx.state.user;
  const {
    roadmap: roadmapData,
    invitations: invitationsData,
    customers: customersData,
  } = ctx.request.body;
  if (!Array.isArray(invitationsData) || !Array.isArray(customersData)) {
    ctx.status = 400;
    return;
  }

  const res = await Roadmap.transaction(async (trx) => {
    const roadmap = await Roadmap.query(trx).insertAndFetch(roadmapData);
    const roadmapId = roadmap.id;
    // userInfo role
    await Role.query(trx).insert({
      userId: userInfo.id,
      roadmapId,
      type: RoleType.Admin,
    });

    if (customersData.length) {
      const customers = await Customer.query(trx).insertAndFetch(
        customersData.map(({ name, email, color }: any) => ({
          name,
          email,
          color,
          roadmapId,
        })),
      );
      // add userInfo to representatives if needed
      await Promise.all(
        customers
          .filter((customer) =>
            customersData.find(
              ({ name, email, representatives }) =>
                name === customer.name &&
                email === customer.email &&
                representatives.find(
                  ({ email, checked }: any) =>
                    email === userInfo.email && checked,
                ),
            ),
          )
          .map((customer) =>
            customer.$relatedQuery('representatives', trx).relate([userInfo]),
          ),
      );

      if (invitationsData.length) {
        const invitations = await Invitation.query(trx).insertAndFetch(
          invitationsData.map(({ email, type }) => ({
            id: uuid.v4(),
            email,
            type,
            roadmapId,
          })),
        );

        await Promise.all(
          invitations.map((invitation) => {
            const represented =
              invitationsData.find(({ email }) => email === invitation.email)
                .representativeFor || [];
            const representedCustomers = customers.filter(({ name, email }) =>
              represented.some(
                (rep: any) => rep.name === name && rep.email === email,
              ),
            );
            return invitation
              .$relatedQuery('representativeFor', trx)
              .relate(representedCustomers);
          }),
        );
        await sendInvitations(invitations, roadmap.name);
      }
    }
    return roadmap;
  });

  ctx.body = res;
};

export const patchRoadmaps: RouteHandlerFnc = async (ctx) => {
  const {
    id,
    name,
    description,
    daysPerWorkCalibration,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);

  const updated = await Roadmap.query().patchAndFetchById(
    ctx.params.roadmapId,
    { name: name, description: description },
  );

  if (!updated) {
    return void (ctx.status = 404);
  } else {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserId: ctx.state.user!.id,
      event: ClientEvents.ROADMAP_UPDATED,
      eventParams: [Number(ctx.params.roadmapId)],
    });
    return void (ctx.body = updated);
  }
};

export const deleteRoadmaps: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Roadmap.query()
    .findById(ctx.params.roadmapId)
    .delete();

  if (numDeleted === 1) {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserId: ctx.state.user!.id,
      event: ClientEvents.ROADMAP_UPDATED,
      eventParams: [Number(ctx.params.roadmapId)],
    });
  }
  ctx.status = numDeleted === 1 ? 200 : 404;
};

export const leaveRoadmap: RouteHandlerFnc = async (ctx) => {
  if (!ctx.state.user) throw new Error('User is required');
  const roadmapId = Number(ctx.params.roadmapId);
  const userId = ctx.state.user.id;

  await Role.transaction(async (trx) => {
    const userRole = await Role.query(trx).findById([userId, roadmapId]);

    if (!userRole) {
      ctx.status = 404;
      return;
    }

    if (userRole.type === RoleType.Admin) {
      const numAdmins = await Role.query(trx)
        .where({ roadmapId })
        .andWhere('type', RoleType.Admin)
        .resultSize();

      if (numAdmins === 1) {
        ctx.status = 403;
        ctx.body =
          'Cannot leave as the last admin of roadmap, delete the whole roadmap instead.';
        return;
      }
    }

    await Customer.relatedQuery('representatives', trx)
      .for(Customer.query(trx).where({ roadmapId }))
      .where('id', userId)
      .unrelate();

    const numDeleted = await userRole.$query(trx).delete();
    if (numDeleted === 1) {
      await emitRoadmapEvent(ctx.io, {
        roadmapId,
        dontEmitToUserId: ctx.state.user!.id,
        requirePermission: Permission.RoadmapReadUsers,
        event: ClientEvents.USER_UPDATED,
        eventParams: [roadmapId],
      });
    }
    ctx.status = numDeleted === 1 ? 200 : 500;
  });
};
