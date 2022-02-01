import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { RoadmapsState, TaskmapPosition } from './types';

export const SELECT_CURRENT_ROADMAP: CaseReducer<
  RoadmapsState,
  PayloadAction<number>
> = (state, action) => {
  state.selectedRoadmapId = action.payload;
};

export const CLEAR_CURRENT_ROADMAP: CaseReducer<RoadmapsState> = (state) => {
  state.selectedRoadmapId = undefined;
};

export const SET_TASKMAP_POSITION: CaseReducer<
  RoadmapsState,
  PayloadAction<TaskmapPosition>
> = (state, action) => {
  state.taskmapPosition = action.payload;
};

export const CLEAR_TASKMAP_POSITION: CaseReducer<RoadmapsState> = (state) => {
  state.taskmapPosition = undefined;
};
