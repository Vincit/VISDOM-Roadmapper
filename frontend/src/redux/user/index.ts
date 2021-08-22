import { createSlice } from '@reduxjs/toolkit';
import {
  getUserInfo,
  login,
  logout,
  register,
  patchDefaultRoadmap,
} from './actions';
import { UserState } from './types';
import { GET_USER_INFO_FULFILLED, LOGOUT_FULFILLED } from './reducers';

const initialState: UserState = {
  info: undefined,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserInfo.fulfilled, GET_USER_INFO_FULFILLED);
    builder.addCase(logout.fulfilled, LOGOUT_FULFILLED);
  },
});

export const userActions = {
  ...userSlice.actions,
  getUserInfo,
  login,
  logout,
  register,
  patchDefaultRoadmap,
};
