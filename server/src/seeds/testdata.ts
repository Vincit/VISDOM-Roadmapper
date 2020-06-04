import * as Knex from 'knex';
import User from '../models/user';
import Roadmap from '../models/roadmap';
import { Model } from 'objection';

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
  const testRoadMap = {
    name: 'Test roadmap',
    description: 'Testy roadmap description',
    tasks: [
      {
        '#id': 'task1',
        name: 'Test task 1',
        description: 'Test desc 1',
        ratings: [
          {
            createdBy: {
              id: 1,
            },
            dimension: 0,
            value: 5,
          },
          {
            createdBy: {
              id: 1,
            },
            dimension: 1,
            value: 5,
          },
        ],
      },
      {
        name: 'Test task 2',
        description: 'Test desc 2',
        relatedTasks: [
          {
            '#ref': 'task1',
          },
        ],
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
  await User.query().delete();
  await Roadmap.query().delete();
};

const createTestUsers = async () => {
  await User.query().insert({
    id: 1,
    username: 'BusinessPerson1',
    email: 'biz@business.com',
    group: 'Business',
    password: 'test',
  });
  await User.query().insert({
    id: 2,
    username: 'BusinessPerson2',
    email: 'biz2@business.com',
    group: 'Business',
    password: 'test',
  });
  await User.query().insert({
    id: 3,
    username: 'DeveloperPerson1',
    email: 'dev@coders.com',
    group: 'Developers',
    password: 'test',
  });
  await User.query().insert({
    id: 4,
    username: 'DeveloperPerson2',
    email: 'dev2@coders.com',
    group: 'Developers',
    password: 'test',
  });
  await User.query().insert({
    id: 5,
    username: 'CustomerPerson1',
    email: 'customer@webuystuff.com',
    group: 'Customers',
    password: 'test',
  });
  await User.query().insert({
    id: 6,
    username: 'CustomerPerson2',
    email: 'customer2@webuystuff.com',
    group: 'Customers',
    password: 'test',
  });
};
