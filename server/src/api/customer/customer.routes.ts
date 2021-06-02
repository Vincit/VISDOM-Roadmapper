import { requirePermission } from './../../utils/checkPermissions';
import { IKoaState } from './../../types/customTypes';
import { Permission } from '../../../../shared/types/customTypes';
import KoaRouter from '@koa/router';
import {
  getCustomers,
  postCustomer,
  patchCustomer,
  deleteCustomer,
} from './customer.controller';
import { Context } from 'koa';

const customerRouter = new KoaRouter<IKoaState, Context>();

customerRouter.get(
  '/customers',
  requirePermission(Permission.RoadmapReadUsers),
  getCustomers,
);
customerRouter.post(
  '/customers',
  requirePermission(Permission.RoadmapEdit),
  postCustomer,
);
customerRouter.patch(
  '/customers/:customerId',
  requirePermission(Permission.RoadmapEdit),
  patchCustomer,
);
customerRouter.delete(
  '/customers/:customerId',
  requirePermission(Permission.RoadmapEdit),
  deleteCustomer,
);

export default customerRouter;
