import { createSlice } from '@reduxjs/toolkit';
import { SET_PLANNER_TIME_ESTIMATE } from './reducers';
import { VersionsState } from './types';

const initialState: VersionsState = {
  timeEstimates: [],
};

export const versionsSlice = createSlice({
  name: 'versions',
  initialState,
  reducers: {
    setTimeEstimate: SET_PLANNER_TIME_ESTIMATE,
  },
});

export const versionsActions = {
  ...versionsSlice.actions,
};
