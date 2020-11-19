import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { Roadmap } from './types';

export const roadmapsSelector = (state: RootState): Roadmap[] | undefined =>
  state.roadmaps.roadmaps;

export const chosenRoadmapIdSelector = (state: RootState): number | undefined =>
  state.roadmaps.selectedRoadmapId;

export const chosenRoadmapSelector = createSelector(
  (state: RootState) => {
    return state.roadmaps.roadmaps?.find(
      (roadmap) => roadmap.id === state.roadmaps.selectedRoadmapId,
    );
  },
  (roadmap) => roadmap,
);

export const taskSelector = (id: number) => {
  return createSelector(chosenRoadmapSelector, (roadmap) =>
    roadmap?.tasks.find((task) => task.id === id),
  );
};
export const allTasksSelector = () => {
  return createSelector(
    chosenRoadmapSelector,
    (roadmap) => roadmap?.tasks || [],
  );
};

export const publicUsersSelector = createSelector(
  (state: RootState) => state.roadmaps.allUsers,
  (users) => users,
);

export const userSelector = (id: number) => {
  return createSelector(publicUsersSelector, (users) =>
    users?.find((user) => user.id === id),
  );
};

export const plannerUserWeightsSelector = () => {
  return createSelector(
    chosenRoadmapSelector,
    (roadmap) => roadmap?.plannerUserWeights || [],
  );
};

export const chosenJiraconfigurationSelector = () => {
  return createSelector(
    chosenRoadmapSelector,
    (roadmap) => roadmap?.jiraconfiguration,
  );
};
