import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  RoadmapRequest,
  TaskRequest,
  TaskratingRequest,
  RelatedtaskRequest,
} from './types';
import { api } from '../../api/api';

export const getRoadmaps = createAsyncThunk(
  'roadmaps/getRoadmaps',
  async () => {
    return api.getRoadmaps();
  },
);

export const addRoadmap = createAsyncThunk(
  'roadmaps/addRoadmap',
  async (roadmap: RoadmapRequest) => {
    return api.addRoadmap(roadmap);
  },
);

export const deleteRoadmap = createAsyncThunk(
  'roadmaps/deleteRoadmap',
  async (roadmap: RoadmapRequest) => {
    return api.deleteRoadmap(roadmap);
  },
);

export const addTask = createAsyncThunk(
  'roadmaps/addTask',
  async (task: TaskRequest) => {
    return api.addTask(task);
  },
);

export const deleteTask = createAsyncThunk(
  'roadmaps/deleteTask',
  async (task: TaskRequest) => {
    return api.deleteTask(task);
  },
);

export const addTaskrating = createAsyncThunk(
  'roadmaps/addTaskrating',
  async (taskrating: TaskratingRequest) => {
    return api.addTaskrating(taskrating);
  },
);

export const deleteTaskrating = createAsyncThunk(
  'roadmaps/deleteTaskrating',
  async (taskrating: TaskratingRequest) => {
    return api.deleteTaskrating(taskrating);
  },
);

export const addRelatedtask = createAsyncThunk(
  'roadmaps/addRelatedTask',
  async (relatedTaskRequest: RelatedtaskRequest) => {
    return api.addRelatedTask(relatedTaskRequest);
  },
);
