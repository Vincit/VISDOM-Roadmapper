import { createSlice } from '@reduxjs/toolkit';
import { getUserInfo } from './actions';
import { UserState } from './types';
import { GET_USER_INFO_FULFILLED } from './reducers';

const initialState: UserState = {
  info: {
    name: '',
    email: '',
    uuid: '',
    group: '',
  },
  loggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(getUserInfo.fulfilled, GET_USER_INFO_FULFILLED),
});
