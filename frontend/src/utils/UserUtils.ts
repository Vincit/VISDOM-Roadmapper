/* eslint-disable no-bitwise */
import { RoadmapRole, UserInfo } from '../redux/user/types';
import { Customer, RoadmapUser } from '../redux/roadmaps/types';
import { RoleType } from '../../../shared/types/customTypes';

export const getType = (
  roles: RoadmapRole[] | undefined,
  roadmapId: number | undefined,
) => {
  return roles?.find((roadmapRole) => roadmapRole.roadmapId === roadmapId)
    ?.type;
};

export const isUserInfo = (
  user: Customer | RoadmapUser | UserInfo,
): user is UserInfo => 'roles' in user;

export const representsCustomers = (user: UserInfo, roadmapId: number) =>
  !!user.representativeFor?.some(
    (customer) => customer.roadmapId === roadmapId,
  );

export const hasPermission = (type: RoleType | undefined, permission: number) =>
  type !== undefined && (type & permission) === permission;
