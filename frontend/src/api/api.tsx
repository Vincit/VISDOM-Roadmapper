import Axios, { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
import {
  ImportBoardRequest,
  IntegrationConfigurationRequest,
  OAuthURLResponse,
  OAuthTokenSwapRequest,
  IntegrationConfiguration,
  Customer,
  CustomerRequest,
  teamMemberRequest,
  PublicUser,
  RoadmapUser,
  RoadmapRoleResponse,
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
import { IntegrationBoard, Integrations } from '../redux/types';
import {
  UserInfo,
  UserLoginRequest,
  UserRegisterRequest,
} from '../redux/user/types';
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
  if (!response.data.integrations) response.data.integrations = [];
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
    {
      name: task.name,
      description: task.description,
      completed: task.completed,
    },
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
    { value: taskrating.value, comment: taskrating.comment },
  );

  return response.data as Taskrating;
};

const getCustomers = async (roadmapId: number) => {
  const response = await axios.get(`roadmaps/${roadmapId}/customers`);
  return response.data as Customer[];
};

const addCustomer = async (customer: CustomerRequest, roadmapId: number) => {
  const response = await axios.post(
    `roadmaps/${roadmapId}/customers/`,
    customer,
  );
  return response.data as Customer;
};

const deleteCustomer = async (customer: CustomerRequest, roadmapId: number) => {
  await axios.delete(`roadmaps/${roadmapId}/customers/${customer.id}`);
  return customer;
};

const deleteTeamMember = async (
  member: teamMemberRequest,
  roadmapId: number,
) => {
  await axios.delete(`roadmaps/${roadmapId}/users/${member.id}/roles`);
  return member;
};

const patchCustomer = async (customer: CustomerRequest, roadmapId: number) => {
  const response = await axios.patch(
    `roadmaps/${roadmapId}/customers/${customer.id}`,
    customer,
  );
  return response.data as Customer;
};

const patchTeamMember = async (
  member: teamMemberRequest,
  roadmapId: number,
) => {
  const response = await axios.patch(
    `roadmaps/${roadmapId}/users/${member.id}/roles`,
    member,
  );
  return response.data as RoadmapRoleResponse;
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

const getCurrentUserInfo = async (roadmapId?: number) => {
  if (roadmapId) {
    const response = await axios.get(`/roadmaps/${roadmapId}/whoami`);
    return response.data as UserInfo;
  }
  const response = await axios.get(`/users/whoami`);
  return response.data as UserInfo;
};

const register = async (newUser: UserRegisterRequest) => {
  const response = await axios.post(`/users/register`, newUser);
  return response.status === 200;
};

const getRoadmapUsers = async (roadmapId: number) => {
  const response = await axios.get(`roadmaps/${roadmapId}/users`);
  return response.data as RoadmapUser[];
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
    {
      name: version.name,
      tasks: version.tasks,
      sortingRank: version.sortingRank,
    },
  );
  return response.data as Version;
};

const patchUser = async (user: PublicUserRequest) => {
  const response = await axios.patch(`/users/${user.id}`, {
    username: user.username,
  });
  return response.data as PublicUser;
};

const getIntegrations = async (roadmapId: number) => {
  const response = await axios.get(`roadmaps/${roadmapId}/integrations`);
  return response.data as Integrations;
};

const getIntegrationBoards = async (
  name: string,
  request: GetRoadmapBoardsRequest,
) => {
  const response = await axios.get(
    `/roadmaps/${request.roadmapId}/integrations/${name}/boards`,
  );
  return response.data as IntegrationBoard[];
};

const getIntegrationBoardLabels = async (
  name: string,
  request: GetRoadmapBoardLabelsRequest,
) => {
  const response = await axios.get(
    `/roadmaps/${request.roadmapId}/integrations/${name}/boards/${request.boardId}/labels`,
  );
  return response.data as string[];
};

const importIntegrationBoard = async (
  name: string,
  request: ImportBoardRequest,
) => {
  await axios.post(
    `/roadmaps/${request.roadmapId}/integrations/${name}/boards/${request.boardId}/import`,
    request,
  );
  return true;
};

const getIntegrationOauthURL = async (name: string, roadmapId: number) => {
  const response = await axios.get(
    `/roadmaps/${roadmapId}/integrations/${name}/oauth/authorizationurl`,
  );
  return response.data as OAuthURLResponse;
};

const swapIntegrationOAuthToken = async (
  name: string,
  swapRequest: OAuthTokenSwapRequest,
  roadmapId: number,
) => {
  await axios.post(
    `/roadmaps/${roadmapId}/integrations/${name}/oauth/swaptoken`,
    swapRequest,
  );
  return true;
};

const addIntegrationConfiguration = async (
  name: string,
  configuration: IntegrationConfigurationRequest,
  roadmapId: number,
) => {
  const response = await axios.post(
    `roadmaps/${roadmapId}/integrations/${name}/configuration`,
    configuration,
  );
  return response.data as IntegrationConfiguration;
};

const patchIntegrationConfiguration = async (
  name: string,
  configuration: IntegrationConfigurationRequest,
  roadmapId: number,
) => {
  const { host, consumerkey, privatekey } = configuration;
  const response = await axios.patch(
    `roadmaps/${roadmapId}/integrations/${name}/configuration/${configuration.id}`,
    { host, consumerkey, privatekey },
  );
  return response.data as IntegrationConfiguration;
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
  register,
  getCurrentUserInfo,
  getCurrentUserToken,
  generateCurrentUserToken,
  deleteCurrentUserToken,
  patchTask,
  getCustomers,
  addCustomer,
  deleteCustomer,
  deleteTeamMember,
  patchCustomer,
  patchTeamMember,
  getRoadmapUsers,
  patchTaskrating,
  getVersions,
  addVersion,
  patchVersion,
  deleteVersion,
  patchUser,
  getIntegrations,
  getIntegrationBoards,
  getIntegrationBoardLabels,
  importIntegrationBoard,
  getIntegrationOauthURL,
  swapIntegrationOAuthToken,
  addIntegrationConfiguration,
  patchIntegrationConfiguration,
};
