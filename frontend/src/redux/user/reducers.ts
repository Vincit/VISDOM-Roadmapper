import { PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserInfo } from './types';

export const GET_USER_INFO_FULFILLED = (
  state: UserState,
  action: PayloadAction<UserInfo>,
) => {
  state.info = action.payload;
};

export const LOGIN_FULFILLED = (state: UserState) => {
  state.loggedIn = true;
};

export const LOGOUT_FULFILLED = (state: UserState) => {
  state.loggedIn = false;
  state.info = undefined;
};
