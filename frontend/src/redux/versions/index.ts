import { createSlice } from '@reduxjs/toolkit';
import {
  addTaskToVersion,
  addVersion,
  deleteVersion,
  getVersions,
  patchVersion,
  removeTaskFromVersion,
} from './actions';
import {
  ADD_VERSION_FULFILLED,
  DELETE_VERSION_FULFILLED,
  GET_VERSIONS_FULFILLED,
  PATCH_VERSION_FULFILLED,
  SET_PLANNER_TIME_ESTIMATE,
} from './reducers';
import { VersionsState } from './types';

const initialState: VersionsState = {
  versions: undefined,
  timeEstimates: [],
};

export const versionsSlice = createSlice({
  name: 'versions',
  initialState,
  reducers: {
    setTimeEstimate: SET_PLANNER_TIME_ESTIMATE,
  },
  extraReducers: (builder) => {
    builder.addCase(addVersion.fulfilled, ADD_VERSION_FULFILLED);
    builder.addCase(getVersions.fulfilled, GET_VERSIONS_FULFILLED);
    builder.addCase(patchVersion.fulfilled, PATCH_VERSION_FULFILLED);
    builder.addCase(deleteVersion.fulfilled, DELETE_VERSION_FULFILLED);
  },
});

export const versionsActions = {
  ...versionsSlice.actions,
  addVersion,
  getVersions,
  patchVersion,
  deleteVersion,
  addTaskToVersion,
  removeTaskFromVersion,
};
