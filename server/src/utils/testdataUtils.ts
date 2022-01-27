import User from '../api/users/users.model';
import { Role } from '../api/roles/roles.model';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';

export const testUsers = {
  BusinessPerson1: { email: 'business.person1@test.com' },
  BusinessPerson2: { email: 'business.person2@test.com' },
  DeveloperPerson1: { email: 'developer.person1@test.com' },
  DeveloperPerson2: { email: 'developer.person2@test.com' },
  AdminPerson1: { email: 'admin.person1@test.com' },
  AdminPerson2: { email: 'admin.person2@test.com' },
} as const;

export const randomTaskratingValue = (
  createdBy: { id: number },
  createdFor: { id: number } | undefined,
  dimension: TaskRatingDimension,
) => ({
  createdBy,
  createdFor,
  dimension,
  value: Math.floor(Math.random() * 5) + 1,
});

export const getUser = async (name: keyof typeof testUsers) =>
  await User.query().findOne('email', testUsers[name].email);

export const insertRoles = async (
  roadmapId: number,
  users: User[],
  roles: Map<keyof typeof testUsers, RoleType>,
) => {
  const rolesByEmail = new Map(
    Object.entries(testUsers).map(([name, { email }]) => [
      email as string,
      roles.get(name as any)!,
    ]),
  );
  await Role.query().insert(
    users
      .filter(({ email }) => rolesByEmail.has(email))
      .map((user) => ({
        type: rolesByEmail.get(user.email)!,
        userId: user.id,
        roadmapId,
      })),
  );
};
