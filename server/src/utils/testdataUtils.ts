import User from '../api/users/users.model';
import { Role } from '../api/roles/roles.model';
import {
  RoleType,
  TaskRatingDimension,
} from '../../../shared/types/customTypes';

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

export const getUser = async (name: string) =>
  await User.query().findOne('username', name);

export const insertRoles = async (
  roadmapId: number,
  users: User[],
  roles: Map<string, RoleType>,
) => {
  await Role.query().insert(
    users
      .filter(({ username }) => roles.has(username))
      .map((user) => ({
        type: roles.get(user.username)!,
        userId: user.id,
        roadmapId,
      })),
  );
};
