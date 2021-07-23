import { loggedInAgent } from './setuptests';
import Roadmap from '../src/api/roadmaps/roadmaps.model';
import Customer from '../src/api/customer/customer.model';
import User from '../src/api/users/users.model';
import { Role } from '../src/api/roles/roles.model';
import TaskRating from '../src/api/taskratings/taskratings.model';
import { Permission } from '../../shared/types/customTypes';

export const withoutPermission = async <T>(
  roadmapId: number,
  permission: Permission,
  work: () => Promise<T>,
) => {
  const userId = (
    await User.query().where({ username: 'AdminPerson1' }).first()
  ).id;

  const role = await Role.query().findById([userId, roadmapId]);
  const original = role.type;
  await role.$query().patch({ type: original & ~permission });
  try {
    return await work();
  } finally {
    await Role.query().patchAndFetchById([userId, roadmapId], {
      type: original,
    });
  }
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

export const postCustomer = async (roadmapId: number, newCustomer: any) => {
  return await loggedInAgent
    .post(`/roadmaps/${roadmapId}/customers`)
    .type('json')
    .send(newCustomer);
};

export const getCustomers = async (roadmapId: number) => {
  return await loggedInAgent.get(`/roadmaps/${roadmapId}/customers`);
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
