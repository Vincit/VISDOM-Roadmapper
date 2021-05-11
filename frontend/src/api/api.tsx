import Axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
import {
  ImportBoardRequest,
  JiraConfigurationRequest,
  JiraOAuthURLResponse,
  JiraOAuthURLRequest,
  JiraTokenSwapRequest,
  JiraConfiguration,
  PublicUser,
  PublicUserRequest,
  Roadmap,
  RoadmapRequest,
  Task,
  Taskrating,
  TaskratingRequest,
  TaskRequest,
  GetRoadmapBoardsRequest,
  GetRoadmapBoardLabelsRequest,
} from '../redux/roadmaps/types';
import { JiraBoard } from '../redux/types';
import { UserInfo, UserLoginRequest } from '../redux/user/types';
import { Version, VersionRequest } from '../redux/versions/types';

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
  if (!response.data.jiraconfiguration) response.data.jiraconfiguration = null;
  return response.data as Roadmap;
};

const deleteRoadmap = async (roadmap: RoadmapRequest) => {
  await axios.delete(`/roadmaps/${roadmap.id}`);
  return roadmap;
};

const addTask = async (task: TaskRequest) => {
  const response = await axios.post(`/roadmaps/${task.roadmapId}/tasks`, task);
  if (!response.data.ratings) response.data.ratings = [];
  return response.data as Task;
};

const patchTask = async (task: TaskRequest, roadmapId: number) => {
  const response = await axios.patch(
    `/roadmaps/${roadmapId}/tasks/${task.id}`,
    task,
  );
  return response.data as Task;
};

const deleteTask = async (task: TaskRequest) => {
  await axios.delete(`/roadmaps/${task.roadmapId}/tasks/${task.id}`);
  return task;
};

const addTaskrating = async (
  taskrating: TaskratingRequest,
  roadmapId: number,
) => {
  const response = await axios.post(
    `/roadmaps/${roadmapId}/tasks/${taskrating.parentTask}/taskratings`,
    taskrating,
  );
  return response.data as Taskrating;
};

const deleteTaskrating = async (
  taskrating: TaskratingRequest,
  roadmapId: number,
) => {
  await axios.delete(
    `/roadmaps/${roadmapId}/tasks/${taskrating.parentTask}/taskratings/${taskrating.id}`,
  );

  return taskrating;
};

const patchTaskrating = async (
  taskrating: TaskratingRequest,
  roadmapId: number,
) => {
  const response = await axios.patch(
    `/roadmaps/${roadmapId}/tasks/${taskrating.parentTask}/taskratings/${taskrating.id}`,
    taskrating,
  );

  return response.data as Taskrating;
};

const login = async (loginRequest: UserLoginRequest) => {
  const response = await axios.post(`/users/login`, loginRequest);
  return response.status === 200;
};

const logout = async () => {
  const response = await axios.get(`/users/logout`);
  return response.status === 200;
};

const getCurrentUserToken = async () => {
  const response = await axios.get(`/users/mytoken`);
  return response.data as string;
};

const generateCurrentUserToken = async () => {
  const response = await axios.post(`/users/mytoken`);
  return response.data as string;
};

const deleteCurrentUserToken = async () => {
  const response = await axios.delete(`/users/mytoken`);
  return response.status === 200;
};

const getCurrentUserInfo = async (roadmapId: number) => {
  if (roadmapId) {
    const response = await axios.get(`/roadmaps/${roadmapId}/whoami`);
    return response.data as UserInfo;
  }
  const response = await axios.get(`/users/whoami`);
  return response.data as UserInfo;
};

const getPublicUsers = async (roadmapId: number) => {
  const response = await axios.get(`roadmaps/${roadmapId}/users`);
  return response.data as PublicUser[];
};

const getVersions = async (roadmapId: number) => {
  const response = await axios.get(`/roadmaps/${roadmapId}/versions`);
  return response.data as Version[];
};

const addVersion = async (version: VersionRequest) => {
  const response = await axios.post(
    `/roadmaps/${version.roadmapId}/versions`,
    version,
  );
  return response.data as Version;
};

const deleteVersion = async (version: VersionRequest) => {
  await axios.delete(`/roadmaps/${version.roadmapId}/versions/${version.id}`);
  return version;
};

const patchVersion = async (version: VersionRequest) => {
  const response = await axios.patch(
    `/roadmaps/${version.roadmapId}/versions/${version.id}`,
    version,
  );
  return response.data as Version;
};

const patchUser = async (user: PublicUserRequest) => {
  const response = await axios.patch(`/users/${user.id}`, user);
  return response.data as PublicUser;
};

const getJiraBoards = async (request: GetRoadmapBoardsRequest) => {
  const response = await axios.get(
    `/roadmaps/${request.roadmapId}/jira/boards`,
  );
  return response.data as JiraBoard[];
};

const getJiraBoardLabels = async (request: GetRoadmapBoardLabelsRequest) => {
  const response = await axios.get(
    `/roadmaps/${request.roadmapId}/jira/boards/labels/${request.boardId}`,
  );
  return response.data as string[];
};

const importJiraBoard = async (request: ImportBoardRequest) => {
  await axios.post(`/roadmaps/${request.roadmapId}/jira/importboard`, request);
  return true;
};

const getJiraOauthURL = async (
  jiraconfiguration: JiraOAuthURLRequest,
  roadmapId: number,
) => {
  const response = await axios.get(
    `/roadmaps/${roadmapId}/jira/oauthauthorizationurl/${jiraconfiguration.id}`,
  );
  return response.data as JiraOAuthURLResponse;
};

const swapJiraOAuthToken = async (
  swapRequest: JiraTokenSwapRequest,
  roadmapId: number,
) => {
  await axios.post(
    `/roadmaps/${roadmapId}/jira/swapoauthtoken/${swapRequest.id}`,
    swapRequest,
  );
  return true;
};

const addJiraconfiguration = async (
  jiraconfiguration: JiraConfigurationRequest,
  roadmapId: number,
) => {
  const response = await axios.post(
    `roadmap/${roadmapId}/jiraconfigurations`,
    jiraconfiguration,
  );
  return response.data as JiraConfiguration;
};

const patchJiraconfiguration = async (
  jiraconfiguration: JiraConfigurationRequest,
  roadmapId: number,
) => {
  const response = await axios.patch(
    `roadmap/${roadmapId}/jiraconfigurations/${jiraconfiguration.id}`,
    jiraconfiguration,
  );
  return response.data as JiraConfiguration;
};

export const api = {
  getRoadmaps,
  addRoadmap,
  deleteRoadmap,
  addTask,
  deleteTask,
  addTaskrating,
  deleteTaskrating,
  login,
  logout,
  getCurrentUserInfo,
  getCurrentUserToken,
  generateCurrentUserToken,
  deleteCurrentUserToken,
  patchTask,
  getPublicUsers,
  patchTaskrating,
  getVersions,
  addVersion,
  patchVersion,
  deleteVersion,
  patchUser,
  getJiraBoards,
  getJiraBoardLabels,
  importJiraBoard,
  getJiraOauthURL,
  swapJiraOAuthToken,
  addJiraconfiguration,
  patchJiraconfiguration,
};
