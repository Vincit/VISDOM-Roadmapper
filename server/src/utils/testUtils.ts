import { loggedInAgent } from '../../tests/setuptests';
import Roadmap from '../api/roadmaps/roadmaps.model';
import Customer from '../api/customer/customer.model';
import User from '../api/users/users.model';
import { Role } from '../api/roles/roles.model';
import { Permission, RoleType } from '../../../shared/types/customTypes';

export const removePermission = async (permission: Permission) => {
  const firstRoadmapId = (await Roadmap.query().first()).id;
  const userId = (
    await User.query().where({ username: 'AdminPerson1' }).first()
  ).id;

  await Role.query().patchAndFetchById([userId, firstRoadmapId], {
    type: RoleType.Admin & ~permission,
  });
};

export const updateCustomer = async (customer: Customer, newData: any) => {
  const firstRoadmapId = (await Roadmap.query().first()).id;
  return await loggedInAgent
  .patch(`/roadmaps/${firstRoadmapId}/customers/${customer.id}`)
  .type('json')
  .send(newData);
};

export const postCustomer = async (newCustomer: any) => {
  const firstRoadmapId = (await Roadmap.query().first()).id;
  return await loggedInAgent
  .post(`/roadmaps/${firstRoadmapId}/customers`)
  .type('json')
  .send(newCustomer);
};

export const getCustomers = async () => {
  const firstRoadmapId = (await Roadmap.query().first()).id;
  return await loggedInAgent.get(`/roadmaps/${firstRoadmapId}/customers`);
};

export const deleteCustomer = async (customer: Customer) => {
  const firstRoadmapId = (await Roadmap.query().first()).id;
  return await loggedInAgent
    .delete(`/roadmaps/${firstRoadmapId}/customers/${customer.id}`);
};
