import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { UserLoginRequest, UserInfo } from './types';
import { api } from '../../api/api';

export const getUserInfo = createAsyncThunk<
  UserInfo,
  void,
  { rejectValue: AxiosError }
>('user/getUserInfoStatus', async (_, thunkAPI) => {
  try {
    return await api.getCurrentUserInfo();
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const login = createAsyncThunk<
  boolean,
  UserLoginRequest,
  { rejectValue: AxiosError }
>('user/login', async (loginRequest: UserLoginRequest, thunkAPI) => {
  try {
    const success = await api.login(loginRequest);
    if (success) await thunkAPI.dispatch(getUserInfo());
    return success;
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const logout = createAsyncThunk<
  boolean,
  void,
  { rejectValue: AxiosError }
>('user/logout', async (_, thunkAPI) => {
  try {
    return await api.logout();
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});
