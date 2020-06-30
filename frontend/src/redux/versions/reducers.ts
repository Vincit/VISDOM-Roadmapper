import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { Version, VersionRequest, VersionsState } from './types';

export const GET_VERSIONS_FULFILLED = (
  state: VersionsState,
  action: PayloadAction<Version[]>,
) => {
  state.versions = action.payload;
};

export const ADD_VERSION_FULFILLED: CaseReducer<
  VersionsState,
  PayloadAction<Version>
> = (state, action) => {
  if (!state.versions) state.versions = [];
  state.versions.push(action.payload);
};

export const SELECT_VERSION_ID: CaseReducer<
  VersionsState,
  PayloadAction<number | undefined>
> = (state, action) => {
  state.selectedVersionId = action.payload;
};

export const DELETE_VERSION_FULFILLED = (
  state: VersionsState,
  action: PayloadAction<VersionRequest>,
) => {
  state.versions = state.versions?.filter(
    (version) => version.id !== action.payload.id,
  );
};

export const PATCH_VERSION_FULFILLED = (
  state: VersionsState,
  action: PayloadAction<Version>,
) => {
  const updateVersion = state.versions?.find(
    (version) => version.id === action.payload.id,
  );

  Object.assign(updateVersion, action.payload);
};
