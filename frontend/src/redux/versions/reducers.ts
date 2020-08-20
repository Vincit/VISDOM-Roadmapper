import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { Version, VersionsState } from './types';

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
