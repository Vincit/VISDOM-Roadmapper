import * as Knex from 'knex';
import { Model } from 'objection';
import Roadmap from '../api/roadmaps/roadmaps.model';
import User from '../api/users/users.model';
import { Role } from '../api/roles/roles.model';
import Version from '../api/versions/versions.model';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';
import Customer from '../api/customer/customer.model';

export async function seed(knex: Knex): Promise<any> {
  Model.knex(knex);
  return createTestData();
}

const createTestData = async () => {
  await clearData();
  await createTestUsers();
  await createTestRoadmap();
  await createTestCustomers();
  await createTestRoles();
};

const createTestRoles = async () => {
  const roles = new Map([
    ['BusinessPerson1', RoleType.Business],
    ['BusinessPerson2', RoleType.Business],
    ['DeveloperPerson1', RoleType.Developer],
    ['DeveloperPerson2', RoleType.Developer],
    ['CustomerPerson1', RoleType.Customer],
    ['CustomerPerson2', RoleType.Customer],
    ['CustomerPerson3', RoleType.Customer],
    ['AdminPerson1', RoleType.Admin],
    ['TokenUser1', RoleType.Admin],
  ]);

  const users = await User.query().select('id', 'username');
  const roadmap = await Roadmap.query().first();
  await Role.query().insert(
    users
      .filter(({ username }) => roles.has(username))
      .map((user) => ({
        type: roles.get(user.username)!,
        userId: user.id,
        roadmapId: roadmap.id,
      })),
  );
};

const createTestCustomers = async () => {
  const roadmap = await Roadmap.query().first();
  const customer1 = await Customer.query().insert({
    roadmapId: roadmap.id,
    name: 'Customer 1',
    color: '#AA75EE',
    email: 'customer1@webuystuff.com',
  });
  const customerPerson1 = await User.query().findOne(
    'username',
    'CustomerPerson1',
  );
  await customerPerson1.$relatedQuery('representativeFor').relate([customer1]);

  const customer2 = await Customer.query().insert({
    roadmapId: roadmap.id,
    name: 'Customer 2',
    color: '#FBD92A',
    email: 'customer2@webuystuff.com',
  });

  const customerPerson2 = await User.query().findOne(
    'username',
    'CustomerPerson2',
  );
  await customerPerson2.$relatedQuery('representativeFor').relate([customer2]);

  const adminUser = await User.query().findOne('username', 'AdminPerson1');
  await adminUser
    .$relatedQuery('representativeFor')
    .relate([customer1, customer2]);
};

const createTestRoadmap = async () => {
  const developerUserId = (
    await User.query().findOne('username', 'DeveloperPerson1')
  ).id;

  const testRoadMap = {
    name: 'Test roadmap',
    description: 'Testy roadmap description',
    tasks: [
      {
        '#id': 'task1',
        name: 'Test task 1',
        description: 'Test desc 1',
        createdBy: {
          id: developerUserId,
        },
        ratings: [
          {
            createdBy: {
              id: developerUserId,
            },
            dimension: TaskRatingDimension.RequiredWork,
            value: 5,
          },
        ],
      },
      {
        name: 'Test task 2',
        description: 'Test desc 2',
        createdBy: {
          id: developerUserId,
        },
      },
    ],
  };

  await Roadmap.query()
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
  await Roadmap.query().delete();
  await Role.query().delete();
};

const createTestUsers = async () => {
  await User.query().insert({
    username: 'BusinessPerson1',
    email: 'biz@business.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'BusinessPerson2',
    email: 'biz2@business.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'DeveloperPerson1',
    email: 'dev@coders.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'DeveloperPerson2',
    email: 'dev2@coders.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'CustomerPerson1',
    email: 'customer@webuystuff.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'CustomerPerson2',
    email: 'customer2@webuystuff.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'CustomerPerson3',
    email: 'customer3@webuystuff.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'CustomerPerson4',
    email: 'customer4@webuystuff.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'CustomerPerson5',
    email: 'customer5@webuystuff.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'AdminPerson1',
    email: 'admin@admins.com',
    password: 'test',
  });
  await User.query().insert({
    username: 'TokenUser1',
    authToken: '61682a02-47aa-4f64-b290-a6958a2beb7b',
    email: 'dummy1@example.com',
    password: 'dummy1',
  });
  await User.query().insert({
    username: 'TokenUser2',
    authToken: '21682a02-47aa-4f64-b290-a6958a2beb7b',
    email: 'dummy2@example.com',
    password: 'dummy2',
  });
};
