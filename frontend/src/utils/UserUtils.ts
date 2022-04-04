import { UserInfo } from '../redux/user/types';
import { Customer, RoadmapUser } from '../redux/roadmaps/types';

export const isUserInfo = (
  user: Customer | RoadmapUser | UserInfo,
): user is UserInfo => 'roles' in user;

export const getType = (
  user: UserInfo | RoadmapUser | undefined,
  roadmapId: number | undefined | null,
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
