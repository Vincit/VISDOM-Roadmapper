import { Knex } from 'knex';
import { Model } from 'objection';
import Roadmap from '../api/roadmaps/roadmaps.model';
import User from '../api/users/users.model';
import Task from '../api/tasks/tasks.model';
import { Role } from '../api/roles/roles.model';
import Version from '../api/versions/versions.model';
import { TaskRelation } from '../api/taskrelation/taskrelation.model';
import {
  TaskRelationType,
  TaskStatus,
} from '../../../shared/types/customTypes';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';
import Customer from '../api/customer/customer.model';
import {
  getUser,
  testUsers,
  randomTaskratingValue,
  insertRoles,
} from '../utils/testdataUtils';

export async function seed(knex: Knex): Promise<any> {
  Model.knex(knex);
  return createTestData();
}

const createTestData = async () => {
  await clearData();
  await createTestUsers();
  await createTestRoadmaps();
  await createTestRoles();
  await createTestCustomers();
  await createTestTasks();
  await createTestVersions();
};

const clearData = async () => {
  await Version.query().delete();
  await User.query().delete();
  await Roadmap.query().delete();
  await Roadmap.query().delete();
  await Role.query().delete();
};

const createTestUsers = async () => {
  await Promise.all(
    Object.values(testUsers).map(({ email }) =>
      User.query().insert({ email, password: 'test', emailVerified: true }),
    ),
  );
};

const createTestRoadmaps = async () => {
  await Roadmap.query().insert({
    name: 'Test roadmap',
    description: 'Testy roadmap description',
  });
  await Roadmap.query().insert({
    name: 'Test roadmap 2',
    description: 'Testy roadmap description 2',
  });
  await Roadmap.query().insert({
    name: 'Test roadmap 3',
    description: 'Testy roadmap description 3',
  });
};

const createTestRoles = async () => {
  const roles = new Map([
    ['BusinessPerson1', RoleType.Business],
    ['BusinessPerson2', RoleType.Business],
    ['DeveloperPerson1', RoleType.Developer],
    ['DeveloperPerson2', RoleType.Developer],
    ['AdminPerson1', RoleType.Admin],
    ['AdminPerson2', RoleType.Admin],
  ] as const);
  const users = await User.query().select('id', 'email');
  const roadmaps = await Roadmap.query().select('id');
  insertRoles(roadmaps[0].id, users, roles);
  insertRoles(roadmaps[1].id, users, roles);

  const roles2 = new Map([
    ['DeveloperPerson1', RoleType.Developer],
    ['AdminPerson1', RoleType.Admin],
  ] as const);
  const users2 = users.filter(
    ({ email }) =>
      email === testUsers.AdminPerson1.email ||
      email === testUsers.DeveloperPerson1.email,
  );
  insertRoles(roadmaps[2].id, users2, roles2);
};

const createTestCustomers = async () => {
  const roadmaps = await Roadmap.query().select('id');
  const customer1 = await Customer.query().insert({
    roadmapId: roadmaps[0].id,
    name: 'Customer 1',
    color: '#AA75EE',
    email: 'customer1@webuystuff.com',
  });
  const businessPerson1 = await getUser('BusinessPerson1');
  await businessPerson1.$relatedQuery('representativeFor').relate([customer1]);

  const customer2 = await Customer.query().insert({
    roadmapId: roadmaps[0].id,
    name: 'Customer 2',
    color: '#FBD92A',
    email: 'customer2@webuystuff.com',
  });
  const businessPerson2 = await getUser('BusinessPerson2');
  await businessPerson2.$relatedQuery('representativeFor').relate([customer2]);

  const customer3 = await Customer.query().insert({
    roadmapId: roadmaps[0].id,
    name: 'Customer 3',
    color: '#FF5C4D',
    email: 'customer3@webuystuff.com',
  });

  const customer4 = await Customer.query().insert({
    roadmapId: roadmaps[2].id,
    name: 'Customer 4',
    color: '#4D99FF',
    email: 'customer3@webuystuff.com',
  });

  const adminUser = await getUser('AdminPerson1');
  await adminUser
    .$relatedQuery('representativeFor')
    .relate([customer1, customer2, customer3, customer4]);
};

const testRatings = async () => {
  const adminId = (await getUser('AdminPerson1')).id;
  const developer1Id = (await getUser('DeveloperPerson1')).id;
  const developer2Id = (await getUser('DeveloperPerson2')).id;
  const business1Id = (await getUser('BusinessPerson1')).id;
  const business2Id = (await getUser('BusinessPerson2')).id;
  const customers = await Customer.query();
  const customer1Id = customers.find(({ name }) => name === 'Customer 1')!.id;
  const customer2Id = customers.find(({ name }) => name === 'Customer 2')!.id;
  const customer3Id = customers.find(({ name }) => name === 'Customer 3')!.id;

  return [
    {
      createdBy: { id: developer1Id },
      dimension: TaskRatingDimension.Complexity,
      value: 2,
      comment: 'No big deal',
    },
    {
      createdBy: { id: developer2Id },
      dimension: TaskRatingDimension.Complexity,
      value: 5,
      comment: 'I would argue this is more demanding task',
    },
    {
      createdBy: { id: adminId },
      createdFor: { id: customer1Id },
      dimension: TaskRatingDimension.BusinessValue,
      value: 5,
    },
    {
      createdBy: { id: business1Id },
      createdFor: { id: customer1Id },
      dimension: TaskRatingDimension.BusinessValue,
      value: 3,
    },
    {
      createdBy: { id: adminId },
      createdFor: { id: customer2Id },
      dimension: TaskRatingDimension.BusinessValue,
      value: 4,
    },
    {
      createdBy: { id: business2Id },
      createdFor: { id: customer2Id },
      dimension: TaskRatingDimension.BusinessValue,
      value: 5,
    },
    {
      createdBy: { id: adminId },
      createdFor: { id: customer3Id },
      dimension: TaskRatingDimension.BusinessValue,
      value: 2,
      comment: 'This is not relevant in their situation',
    },
  ];
};

const createTestTasks = async () => {
  const defaultRatings = await testRatings();
  const adminId = (await getUser('AdminPerson1')).id;
  const createdBy = { id: adminId };

  const tasks = [
    {
      name: 'Test task 1',
      description: 'Test desc 1',
      createdBy,
      ratings: defaultRatings,
    },
    {
      name: 'Test task 2',
      description: 'Test desc 2',
      createdBy,
      ratings: defaultRatings.map(({ createdBy, createdFor, dimension }) =>
        randomTaskratingValue(createdBy, createdFor, dimension),
      ),
      status: TaskStatus.COMPLETED,
    },
    {
      name: 'Test task 3',
      description: 'Test desc 3',
      createdBy,
      ratings: defaultRatings.map(({ createdBy, createdFor, dimension }) =>
        randomTaskratingValue(createdBy, createdFor, dimension),
      ),
    },
    {
      name: 'Test task 4',
      description: 'Test desc 4',
      createdBy,
      ratings: defaultRatings.map(({ createdBy, createdFor, dimension }) =>
        randomTaskratingValue(createdBy, createdFor, dimension),
      ),
      status: TaskStatus.COMPLETED,
    },
    {
      name: 'Test task 5',
      description: 'Test desc 5',
      createdBy,
      ratings: defaultRatings
        .slice(0, 3)
        .map(({ createdBy, createdFor, dimension }) =>
          randomTaskratingValue(createdBy, createdFor, dimension),
        ),
    },
    {
      name: 'Test task 6',
      description: 'Test desc 6',
      createdBy,
    },
    {
      name: 'Test task 7',
      description: 'Test desc 7',
      createdBy,
      ratings: defaultRatings
        .slice(0, 2)
        .map(({ createdBy, createdFor, dimension }) =>
          randomTaskratingValue(createdBy, createdFor, dimension),
        ),
    },
    {
      name: 'Test task 8',
      description: 'Test desc 8',
      createdBy,
      ratings: defaultRatings
        .slice(0, 2)
        .map(({ createdBy, createdFor, dimension }) =>
          randomTaskratingValue(createdBy, createdFor, dimension),
        ),
    },
    {
      name: 'Test task 9',
      description: 'Test desc 9',
      createdBy,
    },
  ];

  const roadmaps = await Roadmap.query().select('id');
  await Roadmap.query()
    .upsertGraph(
      { tasks: (tasks as any).splice(0, 6), id: roadmaps[0].id },
      {
        relate: true,
        noInsert: ['tasks.ratings.createdBy', 'tasks.ratings.createdFor'],
        noUpdate: ['tasks.ratings.createdBy', 'tasks.ratings.createdFor'],
        noDelete: ['tasks.ratings.createdBy', 'tasks.ratings.createdFor'],
        allowRefs: true,
      },
    )
    .upsertGraph(
      { tasks, id: roadmaps[1].id },
      {
        relate: true,
        noInsert: ['tasks.ratings.createdBy', 'tasks.ratings.createdFor'],
        noUpdate: ['tasks.ratings.createdBy', 'tasks.ratings.createdFor'],
        noDelete: ['tasks.ratings.createdBy', 'tasks.ratings.createdFor'],
        allowRefs: true,
      },
    )
    .catch((err) => {
      throw err;
    });

  const fstRoadmapTasks = await Task.query().where({
    roadmapId: roadmaps[0].id,
  });
  const synergyGroup = [
    fstRoadmapTasks[0].id,
    fstRoadmapTasks[1].id,
    fstRoadmapTasks[2].id,
    fstRoadmapTasks[3].id,
  ];
  await TaskRelation.query().insert([
    ...synergyGroup.flatMap((from) =>
      synergyGroup
        .filter((to) => from !== to)
        .map((to) => ({ from, to, type: TaskRelationType.Synergy })),
    ),
    {
      from: fstRoadmapTasks[1].id,
      to: fstRoadmapTasks[5].id,
      type: TaskRelationType.Dependency,
    },
    {
      from: fstRoadmapTasks[2].id,
      to: fstRoadmapTasks[5].id,
      type: TaskRelationType.Dependency,
    },
    {
      from: fstRoadmapTasks[5].id,
      to: fstRoadmapTasks[4].id,
      type: TaskRelationType.Dependency,
    },
  ]);
};

const createTestVersions = async () => {
  const roadmaps = await Roadmap.query().select('id');
  const tasks = await Task.query();
  const versions = [
    {
      name: 'Test milestone 1',
      roadmapId: roadmaps[0].id,
      sortingRank: 0,
      tasks: [tasks[0]],
    },
    {
      name: 'Test milestone 2',
      roadmapId: roadmaps[0].id,
      sortingRank: 1,
      tasks: [tasks[1], tasks[2]],
    },
    {
      name: 'Test milestone 3',
      roadmapId: roadmaps[0].id,
      sortingRank: 2,
    },
    {
      name: 'Test milestone 4',
      roadmapId: roadmaps[1].id,
      sortingRank: 0,
      tasks: [tasks[8]],
    },
  ];

  await Version.query()
    .upsertGraphAndFetch(versions, {
      relate: true,
      noInsert: ['tasks'],
      noUpdate: ['tasks'],
      noDelete: ['tasks'],
      allowRefs: true,
    })
    .catch((err) => {
      throw err;
    });
};
