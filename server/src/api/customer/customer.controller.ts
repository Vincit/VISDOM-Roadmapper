import { RouteHandlerFnc } from '../../types/customTypes';
import Customer from './customer.model';
import User from '../users/users.model';

export const getCustomers: RouteHandlerFnc = async (ctx, _) => {
  const customers = await Customer.query()
    .where('roadmapId', Number(ctx.params.roadmapId))
    .withGraphFetched('[representatives]');
  ctx.body = customers;
};

export const postCustomer: RouteHandlerFnc = async (ctx, _) => {
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
    }
    return await customer.$query(trx).withGraphFetched('representatives');
  });
  ctx.body = inserted;
};

const difference = <T>(old: T[], updated: T[]) => {
  const oldSet = new Set(old);
  const updatedSet = new Set(updated);
  const removed = old.filter((value) => !updatedSet.has(value));
  const added = updated.filter((value) => !oldSet.has(value));
  return { removed, added };
};

export const patchCustomer: RouteHandlerFnc = async (ctx, _) => {
  const {
    name,
    email,
    value,
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

    const ok = await customer
      .$query(trx)
      .patch({ name: name, email: email, value: value, color: color });
    if (!representatives) return ok && customer;

    const { added, removed } = difference(
      customer.representatives?.map(({ id }) => id) || [],
      representatives || [],
    );

    if (removed.length) {
      await customer
        .$relatedQuery('representatives', trx)
        .whereIn('id', removed)
        .unrelate();
    }
    if (added.length) {
      const users = await User.query(trx)
        .whereIn('id', added)
        .withGraphJoined('roles')
        .andWhere('roles.roadmapId', roadmap);
      await customer.$relatedQuery('representatives', trx).relate(users);
    }

    return await customer.$query(trx).withGraphFetched('representatives');
  });
  if (!updated) {
    return void (ctx.status = 404);
  } else {
    return void (ctx.body = updated);
  }
};

export const deleteCustomer: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Customer.query()
    .findById(Number(ctx.params.customerId))
    .where('roadmapId', Number(ctx.params.roadmapId))
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
