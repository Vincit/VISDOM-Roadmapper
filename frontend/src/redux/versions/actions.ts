import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '../../api/api';
import { chosenRoadmapIdSelector } from '../roadmaps/selectors';
import { RootState } from '../types';
import {
  AddTaskToVersionRequest,
  RemoveTaskFromVersionRequest,
  Version,
  VersionRequest,
} from './types';

export const addVersion = createAsyncThunk<
  Version,
  VersionRequest,
  { rejectValue: AxiosError }
>('versions/addVersion', async (version: VersionRequest, thunkAPI) => {
  try {
    return await api.addVersion({
      roadmapId:
        version.roadmapId ||
        chosenRoadmapIdSelector(thunkAPI.getState() as RootState)!,
      name: version.name,
      tasks: [],
    });
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const getVersions = createAsyncThunk<
  Version[],
  void,
  { rejectValue: AxiosError }
>('versions/getVersions', async (_, thunkAPI) => {
  try {
    return await api.getVersions();
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const patchVersion = createAsyncThunk<
  Version,
  VersionRequest,
  { rejectValue: AxiosError }
>('versions/patchVersion', async (version: VersionRequest, thunkAPI) => {
  try {
    return await api.patchVersion(version);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const deleteVersion = createAsyncThunk<
  VersionRequest,
  VersionRequest,
  { rejectValue: AxiosError }
>('versions/deleteVersion', async (version: VersionRequest, thunkAPI) => {
  try {
    return await api.deleteVersion(version);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const addTaskToVersion = createAsyncThunk<
  Version,
  AddTaskToVersionRequest,
  { rejectValue: AxiosError }
>(
  'versions/addTaskToVersion',
  async (request: AddTaskToVersionRequest, thunkAPI) => {
    const versionCopy = { ...request.version };
    versionCopy.tasks = [...versionCopy.tasks];
    versionCopy.tasks.splice(request.index, 0, request.task.id!);
    try {
      const res = await thunkAPI.dispatch(patchVersion(versionCopy));
      if (patchVersion.rejected.match(res)) {
        return thunkAPI.rejectWithValue(res.payload!);
      }
      return res.payload;
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  },
);

export const removeTaskFromVersion = createAsyncThunk<
  Version,
  RemoveTaskFromVersionRequest,
  { rejectValue: AxiosError }
>(
  'versions/removeTaskFromVersion',
  async (request: RemoveTaskFromVersionRequest, thunkAPI) => {
    const versionCopy = { ...request.version };
    versionCopy.tasks = versionCopy.tasks.filter(
      (taskId) => taskId !== request.task.id,
    );
    try {
      const res = await thunkAPI.dispatch(patchVersion(versionCopy));
      if (patchVersion.rejected.match(res)) {
        return thunkAPI.rejectWithValue(res.payload!);
      }
      return res.payload;
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  },
);
