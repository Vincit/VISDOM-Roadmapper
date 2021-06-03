import { PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserInfo } from './types';

export const GET_USER_INFO_FULFILLED = (
  state: UserState,
  action: PayloadAction<UserInfo>,
) => {
  state.info = action.payload;
};

export const LOGOUT_FULFILLED = (state: UserState) => {
  state.info = undefined;
};
