import Axios from 'axios';
import dotenv from 'dotenv';
import {
  Roadmap,
  RoadmapRequest,
  TaskRequest,
  Task,
  TaskratingRequest,
  Taskrating,
  RelatedtaskRequest,
  RelatedtaskResponsePayload,
} from '../redux/roadmaps/types';

dotenv.config();
const axiosConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL,
};

const axios = Axios.create(axiosConfig);

const getRoadmaps = async () => {
  const response = await axios.get('/roadmaps?eager=1');
  return response.data as Roadmap[];
};

const addRoadmap = async (roadmap: RoadmapRequest) => {
  const response = await axios.post('/roadmaps', roadmap);
  return response.data as Roadmap;
};

const deleteRoadmap = async (roadmap: RoadmapRequest) => {
  await axios.delete(`/roadmaps/${roadmap.id}`);
  return roadmap;
};

const addTask = async (task: TaskRequest) => {
  const response = await axios.post(
    `/roadmaps/${task.parentRoadmap}/tasks`,
    task,
  );
  return response.data as Task;
};

const deleteTask = async (task: TaskRequest) => {
  await axios.delete(`/tasks/${task.id}`);
  return task;
};

const addTaskrating = async (taskrating: TaskratingRequest) => {
  const response = await axios.post(
    `/tasks/${taskrating.parentTask}/ratings`,
    taskrating,
  );
  return response.data as Taskrating;
};

const deleteTaskrating = async (taskrating: TaskratingRequest) => {
  await axios.delete(`/taskratings/${taskrating.id}`);

  return taskrating;
};

const addRelatedTask = async (relatedTaskRequest: RelatedtaskRequest) => {
  const response = await axios.post(
    `/tasks/${relatedTaskRequest.fromTask}/relatedtasks`,
    { id: relatedTaskRequest.toTask },
  );

  return {
    parentTaskId: relatedTaskRequest.fromTask,
    newRelatedTasks: response.data,
  } as RelatedtaskResponsePayload;
};

export const api = {
  getRoadmaps,
  addRoadmap,
  deleteRoadmap,
  addTask,
  deleteTask,
  addTaskrating,
  deleteTaskrating,
  addRelatedTask,
};
