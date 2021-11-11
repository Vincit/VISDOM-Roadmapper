/* eslint-disable no-bitwise */
import { UserInfo } from '../redux/user/types';
import { Customer, RoadmapUser } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';

export const isUserInfo = (
  user: Customer | RoadmapUser | UserInfo,
): user is UserInfo => 'roles' in user;

export const getType = (
  user: UserInfo | RoadmapUser | undefined,
  roadmapId: number | undefined,
) => {
  if (!user) return undefined;
  if (isUserInfo(user))
    return user.roles.find((roadmapRole) => roadmapRole.roadmapId === roadmapId)
      ?.type;
  return user.type;
};

export const representsCustomers = (user: UserInfo, roadmapId: number) =>
  !!user.representativeFor?.some(
    (customer) => customer.roadmapId === roadmapId,
  );

export const hasPermission = (type: RoleType | undefined, permission: number) =>
  type !== undefined && (type & permission) === permission;
