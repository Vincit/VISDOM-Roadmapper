import User from '../api/users/users.model';
import { Role } from '../api/roles/roles.model';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';

export const testUsers = {
  BusinessPerson1: { email: 'biz@business.com' },
  BusinessPerson2: { email: 'biz2@business.com' },
  DeveloperPerson1: { email: 'dev@coders.com' },
  DeveloperPerson2: { email: 'dev2@coders.com' },
  CustomerPerson1: { email: 'customer@webuystuff.com' },
  CustomerPerson2: { email: 'customer2@webuystuff.com' },
  AdminPerson1: { email: 'admin@admins.com' },
  AdminPerson2: { email: 'admin2@admins.com' },
} as const;

export const randomTaskratingValue = (
  createdBy: { id: number },
  createdFor: { id: number } | undefined,
  dimension: TaskRatingDimension,
) => ({
  createdBy,
  createdFor,
  dimension,
  value: Math.floor(Math.random() * 10) + 1,
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
