import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserLoginRequest } from './types';
import { api } from '../../api/api';

export const getUserInfo = createAsyncThunk(
  'user/getUserInfoStatus',
  async () => {
    return api.getCurrentUserInfo();
  },
);

export const login = createAsyncThunk(
  'user/login',
  async (loginRequest: UserLoginRequest, thunkApi) => {
    try {
      const success = await api.login(loginRequest);
      if (success) await thunkApi.dispatch(getUserInfo());
      return success;
    } catch (err) {
      if (err.response && err.response.status === 401) {
        throw new Error('Invalid username or password.');
      } else {
        throw err;
      }
    }
  },
);

export const logout = createAsyncThunk('user/logout', async () => {
  return api.logout();
});
