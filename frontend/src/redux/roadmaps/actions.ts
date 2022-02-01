import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { userActions } from '../user/index';
import { api } from '../../api/api';
import { Task } from './types';

export const notifyUsers = createAsyncThunk<
  boolean,
  { users: number[]; task: Task; message: string },
  { rejectValue: AxiosError }
>('notify', async (notificationRequest, thunkAPI) => {
  const { users, task, message } = notificationRequest;
  try {
    return await api.sendNotification(users, task, message);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const leaveRoadmap = createAsyncThunk<
  boolean,
  { roadmapId: number },
  { rejectValue: AxiosError }
>('leaveRoadmap', async (leaveRoadmapRequest, thunkAPI) => {
  try {
    const success = await api.leaveRoadmap(leaveRoadmapRequest.roadmapId);
    if (success) {
      await thunkAPI.dispatch(userActions.getUserInfo());
    }
    return success;
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});
