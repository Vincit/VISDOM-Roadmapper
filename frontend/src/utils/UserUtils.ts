import { RoadmapRole, UserInfo } from '../redux/user/types';
import { Customer, RoadmapUser } from '../redux/roadmaps/types';

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
