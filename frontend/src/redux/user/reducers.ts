import { PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserInfo } from './types';
import { RoadmapRoleResponse } from '../roadmaps/types';

export const GET_USER_INFO_FULFILLED = (
  state: UserState,
  action: PayloadAction<UserInfo>,
) => {
  state.info = action.payload;
};

export const LOGOUT_FULFILLED = (state: UserState) => {
  state.info = undefined;
};

export const JOIN_ROADMAP_FULFILLED = (
  state: UserState,
  action: PayloadAction<RoadmapRoleResponse>,
) => {
  if (!state.info) throw new Error('UserInfo has not been fetched yet');
  state.info.roles.push(action.payload);
};

export const VERIFY_EMAIL_FULFILLED = (
  state: UserState,
  action: PayloadAction<boolean>,
) => {
  if (!state.info) throw new Error('UserInfo has not been fetched yet');
  state.info.emailVerified = action.payload;
};
