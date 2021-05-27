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
  Version[],
  VersionRequest,
  { rejectValue: AxiosError }
>('versions/addVersion', async (version: VersionRequest, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    const roadmapId = version.roadmapId || currentroadmapId;
    await api.addVersion({
      roadmapId,
      name: version.name,
      tasks: [],
    });
    return await api.getVersions(roadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const getVersions = createAsyncThunk<
  Version[],
  number,
  { rejectValue: AxiosError }
>('versions/getVersions', async (roadmapId, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return await api.getVersions(roadmapId || currentroadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const patchVersion = createAsyncThunk<
  Version[],
  VersionRequest,
  { rejectValue: AxiosError }
>('versions/patchVersion', async (version: VersionRequest, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    const roadmapId = version.roadmapId || currentroadmapId;
    await api.patchVersion({
      ...version,
      roadmapId,
    });
    return await api.getVersions(roadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const deleteVersion = createAsyncThunk<
  Version[],
  VersionRequest,
  { rejectValue: AxiosError }
>('versions/deleteVersion', async (version: VersionRequest, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    const roadmapId = version.roadmapId || currentroadmapId;
    await api.deleteVersion({
      ...version,
      roadmapId,
    });
    return await api.getVersions(roadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const addTaskToVersion = createAsyncThunk<
  Version[],
  AddTaskToVersionRequest,
  { rejectValue: AxiosError }
>(
  'versions/addTaskToVersion',
  async (request: AddTaskToVersionRequest, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    if (state.versions.versions === undefined)
      throw new Error('Versions not fetched yet!');

    const versionCopy = {
      ...state.versions.versions.find((ver) => ver.id === request.version.id)!,
    };
    const payload = {
      ...versionCopy,
      tasks: versionCopy.tasks.map((task) => task.id),
    };
    payload.tasks.splice(request.index, 0, request.task.id!);
    try {
      const res = await thunkAPI.dispatch(patchVersion(payload));
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
  Version[],
  RemoveTaskFromVersionRequest,
  { rejectValue: AxiosError }
>(
  'versions/removeTaskFromVersion',
  async (request: RemoveTaskFromVersionRequest, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    if (state.versions.versions === undefined)
      throw new Error('Versions not fetched yet!');
    const versionCopy = {
      ...state.versions.versions.find((ver) => ver.id === request.version.id)!,
    };
    const payload = {
      ...versionCopy,
      tasks: versionCopy.tasks.map((task) => task.id),
    };
    payload.tasks = payload.tasks.filter(
      (taskId) => taskId !== request.task.id,
    );
    try {
      const res = await thunkAPI.dispatch(patchVersion(payload));
      if (patchVersion.rejected.match(res)) {
        return thunkAPI.rejectWithValue(res.payload!);
      }
      return res.payload;
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  },
);
