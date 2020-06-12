import Axios, { AxiosRequestConfig } from 'axios';
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
  PublicUser,
} from '../redux/roadmaps/types';
import { UserLoginRequest, UserInfo } from '../redux/user/types';

dotenv.config();
const axiosConfig: AxiosRequestConfig = {
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
};

const axios = Axios.create(axiosConfig);

const getRoadmaps = async () => {
  const response = await axios.get('/roadmaps?eager=1');
  return response.data as Roadmap[];
};

const addRoadmap = async (roadmap: RoadmapRequest) => {
  const response = await axios.post('/roadmaps', roadmap);
  if (!response.data.tasks) response.data.tasks = [];
  return response.data as Roadmap;
};

const deleteRoadmap = async (roadmap: RoadmapRequest) => {
  await axios.delete(`/roadmaps/${roadmap.id}`);
  return roadmap;
};

const addTask = async (task: TaskRequest) => {
  const response = await axios.post(`/roadmaps/${task.roadmapId}/tasks`, task);
  if (!response.data.ratings) response.data.ratings = [];
  if (!response.data.relatedTasks) response.data.relatedTasks = [];
  return response.data as Task;
};

const patchTask = async (task: TaskRequest) => {
  const response = await axios.patch(`/tasks/${task.id}`, task);
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

const login = async (loginRequest: UserLoginRequest) => {
  const response = await axios.post(`/users/login`, loginRequest);
  return response.status === 200;
};

const logout = async () => {
  const response = await axios.get(`/users/logout`);
  return response.status === 200;
};

const getCurrentUserInfo = async () => {
  const response = await axios.get(`/users/whoami`);
  return response.data as UserInfo;
};

const getPublicUsers = async () => {
  const response = await axios.get(`/users`);
  return response.data as PublicUser[];
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
  login,
  logout,
  getCurrentUserInfo,
  patchTask,
  getPublicUsers,
};
