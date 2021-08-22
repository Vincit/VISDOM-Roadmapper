import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { UserLoginRequest, UserInfo, UserRegisterRequest } from './types';
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

export const register = createAsyncThunk<
  boolean,
  UserRegisterRequest,
  { rejectValue: AxiosError }
>('user/register', async (newUser: UserRegisterRequest, thunkAPI) => {
  try {
    if (await api.register(newUser)) {
      await thunkAPI.dispatch(getUserInfo());
      return true;
    }
    return false;
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const patchDefaultRoadmap = createAsyncThunk<
  boolean,
  { userId: number; roadmapId?: number },
  { rejectValue: AxiosError }
>('/users/patchDefaultRoadmap', async (defaultRoadmapRequest, thunkAPI) => {
  const { userId, roadmapId } = defaultRoadmapRequest;
  try {
    return await api.patchDefaultRoadmap(userId, roadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});
