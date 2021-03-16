import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { Version, VersionsState, TimeEstimate } from './types';

export const GET_VERSIONS_FULFILLED = (
  state: VersionsState,
  action: PayloadAction<Version[]>,
) => {
  state.versions = action.payload;
};

export const ADD_VERSION_FULFILLED: CaseReducer<
  VersionsState,
  PayloadAction<Version[]>
> = (state, action) => {
  state.versions = action.payload;
};

export const DELETE_VERSION_FULFILLED = (
  state: VersionsState,
  action: PayloadAction<Version[]>,
) => {
  state.versions = action.payload;
};

export const PATCH_VERSION_FULFILLED = (
  state: VersionsState,
  action: PayloadAction<Version[]>,
) => {
  state.versions = action.payload;
};

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
