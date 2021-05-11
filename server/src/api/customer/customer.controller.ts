import { RouteHandlerFnc } from '../../types/customTypes';
import Customer from './customer.model';

export const getCustomers: RouteHandlerFnc = async (ctx, _) => {
  const customers = await Customer.query()
    .where('roadmapId', Number(ctx.params.roadmapId))
    .withGraphFetched('[representatives]');
  ctx.body = customers;
};

export const postCustomer: RouteHandlerFnc = async (ctx, _) => {
  const roadmapId = Number(ctx.params.roadmapId);
  delete ctx.request.body.id;
  const inserted = await Customer.query().insertAndFetch({
    ...ctx.request.body,
    roadmapId,
  });
  ctx.body = inserted;
};

export const patchCustomer: RouteHandlerFnc = async (ctx, _) => {
  delete ctx.request.body.id;
  delete ctx.request.body.roadmapId;
  const updated = await Customer.query()
    .findById(Number(ctx.params.customerId))
    .where('roadmapId', Number(ctx.params.roadmapId))
    .patchAndFetch(ctx.request.body);
  if (!updated) {
    ctx.status = 404;
  } else {
    ctx.body = updated;
  }
};

export const deleteCustomer: RouteHandlerFnc = async (ctx, _) => {
  const numDeleted = await Customer.query()
    .findById(Number(ctx.params.customerId))
    .where('roadmapId', Number(ctx.params.roadmapId))
    .delete();

  ctx.status = numDeleted == 1 ? 200 : 404;
};
