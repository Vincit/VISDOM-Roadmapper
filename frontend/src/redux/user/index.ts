import { createSlice } from '@reduxjs/toolkit';
import {
  getUserInfo,
  login,
  logout,
  register,
  deleteUser,
  modifyUser,
  patchDefaultRoadmap,
  joinRoadmap,
  verifyEmail,
  getInvitation,
} from './actions';
import { UserState } from './types';
import {
  GET_USER_INFO_FULFILLED,
  LOGOUT_FULFILLED,
  JOIN_ROADMAP_FULFILLED,
  VERIFY_EMAIL_FULFILLED,
  GET_INVITATION_FULFILLED,
} from './reducers';

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
    builder.addCase(getInvitation.fulfilled, GET_INVITATION_FULFILLED);
    builder.addCase(joinRoadmap.fulfilled, JOIN_ROADMAP_FULFILLED);
    builder.addCase(verifyEmail.fulfilled, VERIFY_EMAIL_FULFILLED);
  },
});

export const userActions = {
  ...userSlice.actions,
  getUserInfo,
  login,
  logout,
  register,
  deleteUser,
  modifyUser,
  patchDefaultRoadmap,
  getInvitation,
  joinRoadmap,
  verifyEmail,
};
