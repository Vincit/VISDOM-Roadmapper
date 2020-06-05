import { RootState } from '../types';
import { Roadmap } from './types';

export const roadmapsSelector = (state: RootState): Roadmap[] =>
  state.roadmaps.roadmaps;

export const chosenRoadmapIdSelector = (state: RootState): Number | undefined =>
  state.roadmaps.selectedRoadmapId;

export const chosenRoadmapSelector = (state: RootState): Roadmap | undefined =>
  state.roadmaps.roadmaps.find(
    (roadmap) => roadmap.id === state.roadmaps.selectedRoadmapId,
  );
