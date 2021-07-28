import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { VersionsState, TimeEstimate } from './types';

export const SET_PLANNER_TIME_ESTIMATE: CaseReducer<
  VersionsState,
  PayloadAction<TimeEstimate>
> = (state, action) => {
  const { roadmapId, id, estimate } = action.payload;
  const previous = state.timeEstimates.find(
    (item) => item.roadmapId === roadmapId && item.id === id,
  );
  if (previous) {
    previous.estimate = estimate;
  } else {
    state.timeEstimates.push(action.payload);
  }
};
