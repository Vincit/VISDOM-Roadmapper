import { RootState } from '../types';
import { Roadmap, PublicUser } from './types';

export const roadmapsSelector = (state: RootState): Roadmap[] =>
  state.roadmaps.roadmaps;

export const chosenRoadmapIdSelector = (state: RootState): number | undefined =>
  state.roadmaps.selectedRoadmapId;

export const chosenRoadmapSelector = (state: RootState): Roadmap | undefined =>
  state.roadmaps.roadmaps.find(
    (roadmap) => roadmap.id === state.roadmaps.selectedRoadmapId,
  );

export const publicUsersSelector = (state: RootState): PublicUser[] => {
  return state.roadmaps.allUsers;
};

export const userGroupsSelector = (state: RootState): string[] => {
  const groups = state.roadmaps.allUsers.map((user) => user.group);
  const uniqueGroups = groups.filter((val, ix) => groups.indexOf(val) === ix);
  return uniqueGroups;
};
