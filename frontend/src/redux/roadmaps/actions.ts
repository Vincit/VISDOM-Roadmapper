import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  Roadmap,
  RoadmapRequest,
  TaskRequest,
  Task,
  TaskratingRequest,
  Taskrating,
  RelatedtaskRequest,
  RelatedtaskResponsePayload,
} from './types';

const fakedata = [
  {
    id: 92,
    name: 'Test roadmap',
    description: 'Testy roadmap description',
    tasks: [
      {
        id: 120,
        name: 'Test task 2',
        description: 'Test desc 2',
        parentRoadmap: 92,
        ratings: [],
        relatedTasks: [
          {
            id: 119,
          },
        ],
      },
      {
        id: 119,
        name: 'Test task 1',
        description: 'Test desc 1',
        parentRoadmap: 92,
        ratings: [
          {
            id: 182,
            dimension: 0,
            value: 5,
            parentTask: 119,
            createdByUser: 1,
          },
          {
            id: 183,
            dimension: 1,
            value: 5,
            parentTask: 119,
            createdByUser: 1,
          },
        ],
        relatedTasks: [],
      },
    ],
  },
];

export const getRoadmaps = createAsyncThunk(
  'roadmaps/getRoadmaps',
  async () => {
    // const response = await axios.get('http://localhost:5000/roadmaps');
    return fakedata as Roadmap[];
  },
);

export const addRoadmap = createAsyncThunk(
  'roadmaps/addRoadmap',
  async (roadmap: RoadmapRequest) => {
    const response = await axios.post(
      'http://localhost:5000/roadmaps',
      roadmap,
    );
    return response.data as Roadmap;
  },
);

export const deleteRoadmap = createAsyncThunk(
  'roadmaps/deleteRoadmap',
  async (roadmap: RoadmapRequest) => {
    await axios.delete(`http://localhost:5000/roadmaps/${roadmap.id}`);
    return roadmap;
  },
);

export const addTask = createAsyncThunk(
  'roadmaps/addTask',
  async (task: TaskRequest) => {
    const response = await axios.post(
      `http://localhost:5000/roadmaps/${task.parentRoadmap}/tasks`,
      task,
    );

    return response.data as Task;
  },
);

export const deleteTask = createAsyncThunk(
  'roadmaps/deleteTask',
  async (task: TaskRequest) => {
    await axios.delete(`http://localhost:5000/tasks/${task.id}`);

    return task;
  },
);

export const addTaskrating = createAsyncThunk(
  'roadmaps/addTaskrating',
  async (taskrating: TaskratingRequest) => {
    const response = await axios.post(
      `http://localhost:5000/tasks/${taskrating.parentTask}/ratings`,
      taskrating,
    );

    return response.data as Taskrating;
  },
);

export const deleteTaskrating = createAsyncThunk(
  'roadmaps/deleteTaskrating',
  async (taskrating: TaskratingRequest) => {
    await axios.delete(`http://localhost:5000/taskratings/${taskrating.id}`);

    return taskrating;
  },
);

export const addRelatedtask = createAsyncThunk(
  'roadmaps/addRelatedTask',
  async (relatedTaskRequest: RelatedtaskRequest) => {
    const response = await axios.post(
      `http://localhost:5000/tasks/${relatedTaskRequest.fromTask}/relatedtasks`,
      { id: relatedTaskRequest.toTask },
    );

    return {
      parentTaskId: relatedTaskRequest.fromTask,
      newRelatedTasks: response.data,
    } as RelatedtaskResponsePayload;
  },
);
