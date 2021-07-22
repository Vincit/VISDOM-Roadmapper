import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import Customer from '../src/api/customer/customer.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import TaskRating from '../src/api/taskratings/taskratings.model';
import { Permission, RoleType } from '../../shared/types/customTypes';

export const removePermission = async (permission: Permission) => {
  const firstRoadmapId = (await Roadmap.query().first()).id;
  const userId = (
    await User.query().where({ username: 'AdminPerson1' }).first()
  ).id;

  await Role.query().patchAndFetchById([userId, firstRoadmapId], {
    type: RoleType.Admin & ~permission,
  });
};

export const removePermission2 = async (restrictedRole: RoleType) => {
  const firstRoadmapId = (await Roadmap.query().first()).id;
  const userId = (
    await User.query().where({ username: 'AdminPerson1' }).first()
  ).id;

  await Role.query().patchAndFetchById([userId, firstRoadmapId], {
    type: restrictedRole,
  });
};

export const updateCustomer = async (customer: Customer, newData: any) => {
  const roadmapId = (
    await Roadmap.query().where('id', customer.roadmapId).first()
  ).id;
  return await loggedInAgent
    .patch(`/roadmaps/${roadmapId}/customers/${customer.id}`)
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
  const roadmapId = (
    await Roadmap.query().where('id', customer.roadmapId).first()
  ).id;
  return await loggedInAgent.delete(
    `/roadmaps/${roadmapId}/customers/${customer.id}`,
  );
};

export const getTestRatingData = async () => {
  const rating = await TaskRating.query()
    .first()
    .withGraphFetched('[belongsToTask.[belongsToRoadmap]]');
  const ratingId = rating.id;
  const taskId = rating.belongsToTask?.id;
  const roadmapId = rating.belongsToTask?.belongsToRoadmap.id;
  return { ratingId, taskId, roadmapId };
};
