import { RootState } from '../types';

export const chosenRoadmapIdSelector = (state: RootState): number | undefined =>
  state.roadmaps.selectedRoadmapId;

export const taskmapPositionSelector = (state: RootState) =>
  state.roadmaps.taskmapPosition;
