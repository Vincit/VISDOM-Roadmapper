import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  UserLoginRequest,
  UserInfo,
  UserRegisterRequest,
  UserModifyRequest,
  UserDeleteRequest,
} from './types';
import { api, apiV2 } from '../../api/api';
import { RoadmapRoleResponse, Invitation } from '../roadmaps/types';

export const getUserInfo = createAsyncThunk<
  UserInfo,
  void,
  { rejectValue: AxiosError }
>('user/getUserInfoStatus', async (_, thunkAPI) => {
  try {
    return await api.getCurrentUserInfo();
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const login = createAsyncThunk<
  boolean,
  UserLoginRequest,
  { rejectValue: AxiosError }
>('user/login', async (loginRequest, thunkAPI) => {
  try {
    const success = await api.login(loginRequest);
    if (success) await thunkAPI.dispatch(getUserInfo());
    return success;
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
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
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const register = createAsyncThunk<
  boolean,
  UserRegisterRequest,
  { rejectValue: AxiosError }
>('user/register', async (newUser, thunkAPI) => {
  try {
    if (await api.register(newUser)) {
      await thunkAPI.dispatch(getUserInfo());
      return true;
    }
    return false;
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const deleteUser = createAsyncThunk<
  boolean,
  UserDeleteRequest,
  { rejectValue: AxiosError }
>('/user/deleteUser', async (deleteRequest, thunkAPI) => {
  try {
    return await api.deleteUser(deleteRequest);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const modifyUser = createAsyncThunk<
  boolean,
  UserModifyRequest,
  { rejectValue: AxiosError }
>('/user/patchUser', async (userPatch, thunkAPI) => {
  try {
    if (await api.patchUser(userPatch)) {
      await thunkAPI.dispatch(getUserInfo());
      return true;
    }
    return false;
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
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
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const getInvitation = createAsyncThunk<
  Invitation,
  string,
  { rejectValue: AxiosError }
>('roadmaps/getInvitation', async (invitationId, thunkAPI) => {
  try {
    return await api.getInvitation(invitationId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const joinRoadmap = createAsyncThunk<
  RoadmapRoleResponse,
  { user: UserInfo; invitationLink: string },
  { rejectValue: AxiosError }
>('joinRoadmap', async (joinRequest, thunkAPI) => {
  const { user, invitationLink } = joinRequest;
  try {
    return await api.joinRoadmap(user, invitationLink);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const verifyEmail = createAsyncThunk<
  boolean,
  { user: UserInfo; verificationId: string },
  { rejectValue: AxiosError }
>('verifyEmail', async ({ user, verificationId }, thunkAPI) => {
  try {
    const res = await api.verifyEmail(user, verificationId);
    if (user.roles.length > 0)
      await thunkAPI.dispatch(apiV2.endpoints.refetchUsers.initiate());
    return res;
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const resetPassword = createAsyncThunk<
  boolean,
  { token: string; password: string },
  { rejectValue: AxiosError }
>('resetPassword', async ({ token, password }, thunkAPI) => {
  try {
    return await api.resetPassword(token, password);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});
