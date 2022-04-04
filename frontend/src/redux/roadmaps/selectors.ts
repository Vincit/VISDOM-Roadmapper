import { RootState } from '../types';

export const chosenRoadmapIdSelector = (state: RootState) =>
  state.roadmaps.selectedRoadmapId;

export const taskmapPositionSelector = (state: RootState) =>
  state.roadmaps.taskmapPosition;
