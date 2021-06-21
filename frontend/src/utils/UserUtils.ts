import { RoadmapRole } from '../redux/user/types';

export const getType = (
  roles: RoadmapRole[] | undefined,
  roadmapId: number | undefined,
) => {
  return roles?.find((roadmapRole) => roadmapRole.roadmapId === roadmapId)
    ?.type;
};
