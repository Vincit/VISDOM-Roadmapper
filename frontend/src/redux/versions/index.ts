import { createSlice } from '@reduxjs/toolkit';
import {
  addVersion,
  deleteVersion,
  getVersions,
  patchVersion,
} from './actions';
import {
  ADD_VERSION_FULFILLED,
  DELETE_VERSION_FULFILLED,
  GET_VERSIONS_FULFILLED,
  PATCH_VERSION_FULFILLED,
  SELECT_VERSION_ID,
} from './reducers';
import { VersionsState } from './types';

const initialState: VersionsState = {
  selectedVersionId: undefined,
  versions: undefined,
};

export const versionsSlice = createSlice({
  name: 'versions',
  initialState,
  reducers: {
    selectVersionId: SELECT_VERSION_ID,
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
};
