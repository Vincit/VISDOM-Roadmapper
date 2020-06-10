import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import {
  RoadmapRequest,
  TaskRequest,
  TaskratingRequest,
  RelatedtaskRequest,
  Taskrating,
  Roadmap,
  Task,
  RelatedtaskResponsePayload,
} from './types';
import { api } from '../../api/api';

export const getRoadmaps = createAsyncThunk<
  Roadmap[],
  void,
  { rejectValue: AxiosError }
>('roadmaps/getRoadmaps', async (_, thunkAPI) => {
  try {
    return await api.getRoadmaps();
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const addRoadmap = createAsyncThunk<
  Roadmap,
  RoadmapRequest,
  { rejectValue: AxiosError }
>('roadmaps/addRoadmap', async (roadmap: RoadmapRequest, thunkAPI) => {
  try {
    return await api.addRoadmap(roadmap);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const deleteRoadmap = createAsyncThunk<
  RoadmapRequest,
  RoadmapRequest,
  { rejectValue: AxiosError }
>('roadmaps/deleteRoadmap', async (roadmap: RoadmapRequest, thunkAPI) => {
  try {
    return await api.deleteRoadmap(roadmap);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const addTask = createAsyncThunk<
  Task,
  TaskRequest,
  { rejectValue: AxiosError }
>('roadmaps/addTask', async (task: TaskRequest, thunkAPI) => {
  try {
    return await api.addTask(task);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const deleteTask = createAsyncThunk<
  TaskRequest,
  TaskRequest,
  { rejectValue: AxiosError }
>('roadmaps/deleteTask', async (task: TaskRequest, thunkAPI) => {
  try {
    return await api.deleteTask(task);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const addTaskrating = createAsyncThunk<
  Taskrating,
  TaskratingRequest,
  { rejectValue: AxiosError }
>('roadmaps/addTaskrating', async (taskrating: TaskratingRequest, thunkAPI) => {
  try {
    return await api.addTaskrating(taskrating);
  } catch (err) {
    return thunkAPI.rejectWithValue(err);
  }
});

export const deleteTaskrating = createAsyncThunk<
  TaskratingRequest,
  TaskratingRequest,
  { rejectValue: AxiosError }
>(
  'roadmaps/deleteTaskrating',
  async (taskrating: TaskratingRequest, thunkAPI) => {
    try {
      return await api.deleteTaskrating(taskrating);
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  },
);

export const addRelatedtask = createAsyncThunk<
  RelatedtaskResponsePayload,
  RelatedtaskRequest,
  { rejectValue: AxiosError }
>(
  'roadmaps/addRelatedTask',
  async (relatedTaskRequest: RelatedtaskRequest, thunkAPI) => {
    try {
      return await api.addRelatedTask(relatedTaskRequest);
    } catch (err) {
      return thunkAPI.rejectWithValue(err);
    }
  },
);
