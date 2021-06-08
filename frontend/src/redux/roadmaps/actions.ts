import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { api } from '../../api/api';
import { chosenRoadmapIdSelector } from './selectors';
import { RootState } from '../types';
import {
  ImportBoardRequest,
  Customer,
  CustomerRequest,
  PublicUser,
  RoadmapUser,
  PublicUserRequest,
  Roadmap,
  RoadmapRequest,
  Task,
  Taskrating,
  TaskratingRequest,
  TaskRequest,
  JiraConfigurationRequest,
  JiraConfiguration,
} from './types';

export const getCustomers = createAsyncThunk<
  { roadmapId: number; customers: Customer[] },
  void,
  { rejectValue: AxiosError }
>('roadmaps/getCustomers', async (_, thunkAPI) => {
  try {
    const roadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return {
      roadmapId,
      customers: await api.getCustomers(roadmapId),
    };
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const addCustomer = createAsyncThunk<
  Customer,
  CustomerRequest,
  { rejectValue: AxiosError }
>('roadmaps/addCustomer', async (customer, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return await api.addCustomer(customer, currentroadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const deleteCustomer = createAsyncThunk<
  { roadmapId: number; response: CustomerRequest },
  CustomerRequest,
  { rejectValue: AxiosError }
>('roadmaps/deleteCustomer', async (customer, thunkAPI) => {
  try {
    const roadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return {
      roadmapId,
      response: await api.deleteCustomer(customer, roadmapId),
    };
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const patchCustomer = createAsyncThunk<
  Customer,
  CustomerRequest,
  { rejectValue: AxiosError }
>('roadmaps/patchCustomer', async (customer, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return await api.patchCustomer(customer, currentroadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const getRoadmapUsers = createAsyncThunk<
  RoadmapUser[],
  void,
  { rejectValue: AxiosError }
>('roadmaps/getPublicUsers', async (_, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return await api.getRoadmapUsers(currentroadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const getRoadmaps = createAsyncThunk<
  Roadmap[],
  void,
  { rejectValue: AxiosError }
>('roadmaps/getRoadmaps', async (_, thunkAPI) => {
  try {
    return await api.getRoadmaps();
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
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
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
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
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
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
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const patchTask = createAsyncThunk<
  Task,
  TaskRequest,
  { rejectValue: AxiosError }
>('roadmaps/patchTask', async (task: TaskRequest, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return await api.patchTask(task, currentroadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
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
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const addTaskrating = createAsyncThunk<
  Taskrating,
  TaskratingRequest,
  { rejectValue: AxiosError }
>('roadmaps/addTaskrating', async (taskrating: TaskratingRequest, thunkAPI) => {
  try {
    const currentroadmapId = chosenRoadmapIdSelector(
      thunkAPI.getState() as RootState,
    )!;
    return await api.addTaskrating(taskrating, currentroadmapId);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
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
      const currentroadmapId = chosenRoadmapIdSelector(
        thunkAPI.getState() as RootState,
      )!;
      return await api.deleteTaskrating(taskrating, currentroadmapId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err as AxiosError<any>);
    }
  },
);

export const patchTaskrating = createAsyncThunk<
  Taskrating,
  TaskratingRequest,
  { rejectValue: AxiosError }
>(
  'roadmaps/patchTaskrating',
  async (taskrating: TaskratingRequest, thunkAPI) => {
    try {
      const currentroadmapId = chosenRoadmapIdSelector(
        thunkAPI.getState() as RootState,
      )!;
      return await api.patchTaskrating(taskrating, currentroadmapId);
    } catch (err) {
      return thunkAPI.rejectWithValue(err as AxiosError<any>);
    }
  },
);

export const addOrPatchTaskrating = createAsyncThunk<
  Taskrating,
  TaskratingRequest,
  { rejectValue: AxiosError }
>(
  'roadmaps/patchTaskrating',
  async (taskrating: TaskratingRequest, thunkAPI) => {
    if (taskrating.id) {
      const res = await thunkAPI.dispatch(patchTaskrating(taskrating));
      if (patchTaskrating.rejected.match(res)) {
        return thunkAPI.rejectWithValue(res.payload!);
      }
      return res.payload;
    }

    const res = await thunkAPI.dispatch(addTaskrating(taskrating));
    if (addTaskrating.rejected.match(res)) {
      return thunkAPI.rejectWithValue(res.payload!);
    }
    return res.payload;
  },
);

export const patchPublicUser = createAsyncThunk<
  PublicUser,
  PublicUserRequest,
  { rejectValue: AxiosError }
>('roadmaps/patchPublicUser', async (user: PublicUserRequest, thunkAPI) => {
  try {
    return await api.patchUser(user);
  } catch (err) {
    return thunkAPI.rejectWithValue(err as AxiosError<any>);
  }
});

export const importJiraBoard = createAsyncThunk<
  Roadmap[],
  ImportBoardRequest,
  { rejectValue: AxiosError }
>(
  'roadmaps/importJiraBoard',
  async (importBoardRequest: ImportBoardRequest, thunkAPI) => {
    try {
      await api.importJiraBoard(importBoardRequest);
      return await api.getRoadmaps();
    } catch (err) {
      return thunkAPI.rejectWithValue(err as AxiosError<any>);
    }
  },
);

export const addJiraConfiguration = createAsyncThunk<
  JiraConfiguration,
  JiraConfigurationRequest,
  { rejectValue: AxiosError }
>(
  'jiraconfigurations/addJiraconfiguration',
  async (jiraconfiguration: JiraConfigurationRequest, thunkAPI) => {
    try {
      const currentroadmapId = chosenRoadmapIdSelector(
        thunkAPI.getState() as RootState,
      )!;
      return await api.addJiraconfiguration(
        jiraconfiguration,
        currentroadmapId,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(err as AxiosError<any>);
    }
  },
);

export const patchJiraConfiguration = createAsyncThunk<
  JiraConfiguration,
  JiraConfigurationRequest,
  { rejectValue: AxiosError }
>(
  'jiraconfigurations/patchJiraconfiguration',
  async (jiraconfiguration: JiraConfigurationRequest, thunkAPI) => {
    try {
      const currentroadmapId = chosenRoadmapIdSelector(
        thunkAPI.getState() as RootState,
      )!;
      return await api.patchJiraconfiguration(
        jiraconfiguration,
        currentroadmapId,
      );
    } catch (err) {
      return thunkAPI.rejectWithValue(err as AxiosError<any>);
    }
  },
);
