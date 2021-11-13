import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { Roadmap } from './types';

export const roadmapsSelector = (state: RootState): Roadmap[] | undefined =>
  state.roadmaps.roadmaps;

export const chosenRoadmapIdSelector = (state: RootState): number | undefined =>
  state.roadmaps.selectedRoadmapId;

export const chosenRoadmapSelector = createSelector(
  (state: RootState) =>
    state.roadmaps.roadmaps?.find(
      (roadmap) => roadmap.id === state.roadmaps.selectedRoadmapId,
    ),
  (roadmap) => roadmap,
);

export const idRoadmapSelector = (roadmapId: number) =>
  createSelector(
    (state: RootState) =>
      state.roadmaps.roadmaps?.find((roadmap) => roadmap.id === roadmapId),
    (roadmap) => roadmap,
  );

export const taskSelector = (id: number) =>
  createSelector(chosenRoadmapSelector, (roadmap) =>
    roadmap?.tasks.find((task) => task.id === id),
  );

export const allTasksSelector = createSelector(
  chosenRoadmapSelector,
  (roadmap) => roadmap?.tasks || [],
);

export const allCustomersSelector = createSelector(
  chosenRoadmapSelector,
  (roadmap) => roadmap?.customers,
);

export const customerSelector = (id: number) =>
  createSelector(allCustomersSelector, (customers) =>
    customers?.find((customer) => customer.id === id),
  );

export const roadmapUsersSelector = createSelector(
  chosenRoadmapSelector,
  (roadmap) => roadmap?.users,
);

export const userSelector = (id: number) =>
  createSelector(roadmapUsersSelector, (users) =>
    users?.find((user) => user.id === id),
  );

export const chosenIntegrationSelector = (name: string) =>
  createSelector(chosenRoadmapSelector, (roadmap) =>
    roadmap?.integrations.find((it) => it.name === name),
  );

export const roadmapsVersionsSelector = createSelector(
  chosenRoadmapSelector,
  (roadmap) => {
    if (!roadmap?.versions) return undefined;
    return [...roadmap.versions].sort((a, b) => a.sortingRank - b.sortingRank);
  },
);

export const allInvitationsSelector = createSelector(
  chosenRoadmapSelector,
  (roadmap) => roadmap?.invitations,
);

export const taskmapPositionSelector = (state: RootState) =>
  state.roadmaps.taskmapPosition;
