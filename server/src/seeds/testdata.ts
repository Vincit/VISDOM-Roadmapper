import * as Knex from 'knex';
import { Model } from 'objection';
import Roadmap from '../api/roadmaps/roadmaps.model';
import User from '../api/users/users.model';
import Version from '../api/versions/versions.model';
import { UserType } from '../types/customTypes';

export async function seed(knex: Knex): Promise<any> {
  Model.knex(knex);
  return createTestData();
}

const createTestData = async () => {
  await clearData();
  await createTestUsers();
  await createTestRoadmap();
};

const createTestRoadmap = async () => {
  const firstUserId = (await User.query().first()).id;

  const testRoadMap = {
    name: 'Test roadmap',
    description: 'Testy roadmap description',
    tasks: [
      {
        '#id': 'task1',
        name: 'Test task 1',
        description: 'Test desc 1',
        createdBy: {
          id: firstUserId,
        },
        ratings: [
          {
            createdBy: {
              id: firstUserId,
            },
            dimension: 0,
            value: 5,
          },
        ],
      },
      {
        name: 'Test task 2',
        description: 'Test desc 2',
        createdBy: {
          id: firstUserId,
        },
      },
    ],
  };

  const graph = await Roadmap.query()
    .upsertGraphAndFetch(testRoadMap, {
      relate: true,
      noInsert: ['tasks.ratings.createdBy'],
      noUpdate: ['tasks.ratings.createdBy'],
      noDelete: ['tasks.ratings.createdBy'],
      allowRefs: true,
    })
    .catch((err) => {
      throw err;
    });
};

const clearData = async () => {
  await Version.query().delete();
  await User.query().delete();
  await Roadmap.query().delete();
};

const createTestUsers = async () => {
  const businessPerson1 = await User.query().insert({
    username: 'BusinessPerson1',
    email: 'biz@business.com',
    type: UserType.BusinessUser,
    password: 'test',
  });
  await User.query().insert({
    username: 'BusinessPerson2',
    email: 'biz2@business.com',
    type: UserType.BusinessUser,
    password: 'test',
  });
  const developerPerson1 = await User.query().insert({
    username: 'DeveloperPerson1',
    email: 'dev@coders.com',
    type: UserType.DeveloperUser,
    password: 'test',
  });
  await User.query().insert({
    username: 'DeveloperPerson2',
    email: 'dev2@coders.com',
    type: UserType.DeveloperUser,
    password: 'test',
  });
  const customerPerson1 = await User.query().insert({
    username: 'CustomerPerson1',
    email: 'customer@webuystuff.com',
    type: UserType.CustomerUser,
    password: 'test',
    customerValue: 500000,
  });
  await User.query().insert({
    username: 'CustomerPerson2',
    email: 'customer2@webuystuff.com',
    type: UserType.CustomerUser,
    password: 'test',
    customerValue: 1000000,
  });
  await User.query().insert({
    username: 'CustomerPerson3',
    email: 'customer3@webuystuff.com',
    type: UserType.CustomerUser,
    password: 'test',
  });
  await User.query().insert({
    username: 'CustomerPerson4',
    email: 'customer4@webuystuff.com',
    type: UserType.CustomerUser,
    password: 'test',
  });
  await User.query().insert({
    username: 'CustomerPerson5',
    email: 'customer5@webuystuff.com',
    type: UserType.CustomerUser,
    password: 'test',
  });
  const adminPerson1 = await User.query().insert({
    username: 'AdminPerson1',
    email: 'admin@admins.com',
    type: UserType.AdminUser,
    password: 'test',
  });

  await adminPerson1
    .$relatedQuery('hotSwappableUsers')
    .relate([customerPerson1, developerPerson1, businessPerson1]);
};
