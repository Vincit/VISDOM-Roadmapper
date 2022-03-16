import { ClientEvents } from './../../../../shared/types/sockettypes';
import { emitRoadmapEvent } from './../../utils/socketIoUtils';
import { userHasPermission } from './../../utils/checkPermissions';
import { RouteHandlerFnc } from '../../types/customTypes';
import Customer from './customer.model';
import { Permission } from '../../../../shared/types/customTypes';
import { difference } from '../../utils/array';
import User from '../users/users.model';

export const getCustomers: RouteHandlerFnc = async (ctx) => {
  let query = Customer.query()
    .where('roadmapId', Number(ctx.params.roadmapId))
    .withGraphFetched('[representatives]');

  if (!userHasPermission(ctx, Permission.RoadmapReadCustomerValues)) {
    query = query.select('roadmapId', 'id', 'name', 'email', 'color');
  }
  ctx.body = await query;
};

export const postCustomer: RouteHandlerFnc = async (ctx) => {
  const roadmapId = Number(ctx.params.roadmapId);
  const { id, representatives, ...body } = ctx.request.body;
  const inserted = await Customer.transaction(async (trx) => {
    const customer = await Customer.query(trx).insertAndFetch({
      ...body,
      roadmapId,
    });

    if (representatives?.length > 0) {
      const users = await User.query(trx)
        .whereIn('id', representatives)
        .withGraphJoined('roles')
        .andWhere('roles.roadmapId', roadmapId);

      await customer.$relatedQuery('representatives', trx).relate(users);

      await emitRoadmapEvent(ctx.io, {
        roadmapId: Number(ctx.params.roadmapId),
        onlyEmitToUserIds: users.map((u) => u.id),
        event: ClientEvents.USERINFO_UPDATED,
        eventParams: [],
      });
    }
    return await customer.$query(trx).withGraphFetched('representatives');
  });

  await emitRoadmapEvent(ctx.io, {
    roadmapId: Number(ctx.params.roadmapId),
    dontEmitToUserIds: [ctx.state.user!.id],
    requirePermission: Permission.RoadmapReadUsers,
    event: ClientEvents.CUSTOMER_UPDATED,
    eventParams: [],
  });

  ctx.body = inserted;
};

export const patchCustomer: RouteHandlerFnc = async (ctx) => {
  const {
    id,
    name,
    email,
    weight,
    color,
    representatives,
    ...others
  } = ctx.request.body;
  if (Object.keys(others).length) return void (ctx.status = 400);
  const roadmap = Number(ctx.params.roadmapId);

  const updated = await Customer.transaction(async (trx) => {
    const customer = await Customer.query(trx)
      .findById(Number(ctx.params.customerId))
      .where('roadmapId', roadmap)
      .withGraphFetched('representatives');
    if (!customer) return false;

    if (!representatives)
      return (
        (await customer
          .$query(trx)
          .patchAndFetch({ name, email, weight, color })
          .withGraphFetched('representatives')) ?? false
      );

    const { added, removed } = difference(
      customer.representatives?.map(({ id }) => id) || [],
      representatives || [],
    );

    if (removed.length) {
      await customer
        .$relatedQuery('representatives', trx)
        .whereIn('id', removed)
        .unrelate();

      await emitRoadmapEvent(ctx.io, {
        roadmapId: Number(ctx.params.roadmapId),
        onlyEmitToUserIds: removed,
        event: ClientEvents.USERINFO_UPDATED,
        eventParams: [],
      });
    }

    if (added.length) {
      const users = await User.query(trx)
        .whereIn('id', added)
        .withGraphJoined('roles')
        .andWhere('roles.roadmapId', roadmap);
      await customer.$relatedQuery('representatives', trx).relate(users);

      await emitRoadmapEvent(ctx.io, {
        roadmapId: Number(ctx.params.roadmapId),
        onlyEmitToUserIds: added,
        event: ClientEvents.USERINFO_UPDATED,
        eventParams: [],
      });
    }

    if (!name && !email && !weight && !color)
      return await customer.$query(trx).withGraphFetched('representatives');

    return await customer
      .$query(trx)
      .patchAndFetch({ name, email, weight, color })
      .withGraphFetched('representatives');
  });
  if (!updated) {
    return void (ctx.status = 404);
  } else {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.RoadmapReadUsers,
      event: ClientEvents.CUSTOMER_UPDATED,
      eventParams: [],
    });

    return void (ctx.body = updated);
  }
};

export const deleteCustomer: RouteHandlerFnc = async (ctx) => {
  const numDeleted = await Customer.query()
    .findById(Number(ctx.params.customerId))
    .where('roadmapId', Number(ctx.params.roadmapId))
    .delete();

  if (numDeleted === 1) {
    await emitRoadmapEvent(ctx.io, {
      roadmapId: Number(ctx.params.roadmapId),
      dontEmitToUserIds: [ctx.state.user!.id],
      requirePermission: Permission.RoadmapReadUsers,
      event: ClientEvents.CUSTOMER_UPDATED,
      eventParams: [],
    });
  }

  ctx.status = numDeleted === 1 ? 200 : 404;
};
