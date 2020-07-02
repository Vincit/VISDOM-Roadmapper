import { RootState } from '../types';
import { PublicUser, Roadmap } from './types';

export const roadmapsSelector = (state: RootState): Roadmap[] =>
  state.roadmaps.roadmaps;

export const chosenRoadmapIdSelector = (state: RootState): number | undefined =>
  state.roadmaps.selectedRoadmapId;

export const chosenRoadmapSelector = (state: RootState): Roadmap | undefined =>
  state.roadmaps.roadmaps.find(
    (roadmap) => roadmap.id === state.roadmaps.selectedRoadmapId,
  );

export const publicUsersSelector = (
  state: RootState,
): PublicUser[] | undefined => {
  return state.roadmaps.allUsers;
};
