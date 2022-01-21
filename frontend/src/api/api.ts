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
  RoadmapUserRequest,
  RoadmapUser,
  RoadmapRoleResponse,
  Roadmap,
  RoadmapRequest,
  Task,
  Taskrating,
  TaskratingRequest,
  TaskRequest,
  GetRoadmapBoardsRequest,
  GetRoadmapBoardLabelsRequest,
  Version,
  VersionRequest,
  Invitation,
  InvitationRequest,
  TaskRelation,
  NewInvitation,
} from '../redux/roadmaps/types';
import { IntegrationBoard, Integrations } from '../redux/types';
import {
  UserInfo,
  UserLoginRequest,
  UserModifyRequest,
  UserRegisterRequest,
  UserDeleteRequest,
} from '../redux/user/types';

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

const addTaskratings = async (
  taskratings: TaskratingRequest[],
  taskId: number,
  roadmapId: number,
) => {
  const response = await axios.post(
    `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
    taskratings,
  );
  return response.data as Taskrating[];
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

const patchTaskratings = async (
  taskratings: TaskratingRequest[],
  taskId: number,
  roadmapId: number,
) => {
  const response = await axios.patch(
    `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
    taskratings,
  );
  return response.data as Taskrating[];
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

const patchCustomer = async (customer: CustomerRequest, roadmapId: number) => {
  const response = await axios.patch(
    `roadmaps/${roadmapId}/customers/${customer.id}`,
    customer,
  );
  return response.data as Customer;
};

/** Checks if the given `status` code is in the successful 2xx range */
const successful = (status: number) => status >= 200 && status < 300;

const login = async (loginRequest: UserLoginRequest) => {
  const response = await axios.post(`/users/login`, loginRequest);
  return successful(response.status);
};

const logout = async () => {
  const response = await axios.get(`/users/logout`);
  return successful(response.status);
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
  return successful(response.status);
};

const getCurrentUserInfo = async () => {
  const response = await axios.get(`/users/whoami`);
  return response.data as UserInfo;
};

const register = async (newUser: UserRegisterRequest) => {
  const response = await axios.post(`/users/register`, newUser);
  return successful(response.status);
};

const patchUser = async (userPatch: UserModifyRequest) => {
  const response = await axios.patch(`/users/${userPatch.id}`, userPatch);
  return response.status === 200;
};

const deleteUser = async (userDelete: UserDeleteRequest) => {
  const response = await axios.delete(`/users/${userDelete.id}`, {
    data: userDelete,
  });
  return response.status === 200;
};

const getRoadmapUsers = async (roadmapId: number) => {
  const response = await axios.get(`roadmaps/${roadmapId}/users`);
  return response.data as RoadmapUser[];
};

const patchRoadmapUser = async (
  user: RoadmapUserRequest,
  roadmapId: number,
) => {
  const response = await axios.patch(
    `roadmaps/${roadmapId}/users/${user.id}/roles`,
    user,
  );
  return response.data as RoadmapRoleResponse;
};

const deleteRoadmapUser = async (
  user: RoadmapUserRequest,
  roadmapId: number,
) => {
  await axios.delete(`roadmaps/${roadmapId}/users/${user.id}/roles`);
  return user;
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

const sendNotification = async (
  users: number[],
  task: Task,
  message: string,
) => {
  const response = await axios.post(
    `roadmaps/${task.roadmapId}/tasks/${task.id}/notify`,
    { users, message },
  );
  return successful(response.status);
};

const getInvitations = async (roadmapId: number) => {
  const response = await axios.get(`roadmaps/${roadmapId}/invitations/`);
  return response.data as Invitation[];
};

const getInvitation = async (invitationId: string) => {
  const response = await axios.get(`users/join/${invitationId}`);
  return response.data as Invitation;
};

const sendInvitation = async (roadmapId: number, invitation: NewInvitation) => {
  const response = await axios.post(
    `roadmaps/${roadmapId}/invitations/`,
    invitation,
  );
  return successful(response.status);
};

const patchInvitation = async (
  roadmapId: number,
  invitation: InvitationRequest,
) => {
  const response = await axios.patch(
    `roadmaps/${roadmapId}/invitations/${invitation.id}`,
    invitation,
  );
  return response.data as Invitation;
};

const deleteInvitation = async (roadmapId: number, id: string) => {
  await axios.delete(`roadmaps/${roadmapId}/invitations/${id}`);
  return id;
};

const patchDefaultRoadmap = async (userId: number, roadmapId?: number) => {
  const response = await axios.patch(`users/${userId}`, {
    defaultRoadmapId: roadmapId ?? null,
  });
  return successful(response.status);
};

const joinRoadmap = async (user: UserInfo, invitationLink: string) => {
  const response = await axios.post(`/users/${user.id}/join/${invitationLink}`);
  return response.data as RoadmapRoleResponse;
};

const verifyEmail = async (user: UserInfo, verificationId: string) => {
  const response = await axios.post(
    `/users/${user.id}/verifyEmail/${verificationId}`,
  );
  return successful(response.status);
};

const sendEmailVerificationLink = async (user: UserInfo) => {
  const response = await axios.post(
    `/users/${user.id}/sendEmailVerificationLink/`,
  );
  return successful(response.status);
};

const addTaskRelation = async (roadmapId: number, relation: TaskRelation) => {
  const response = await axios.post(`/roadmaps/${roadmapId}/tasks/relations`, {
    from: relation.from,
    to: relation.to,
    type: relation.type,
  });
  return successful(response.status);
};

const removeTaskRelation = async (
  roadmapId: number,
  relation: TaskRelation,
) => {
  const response = await axios.delete(
    `/roadmaps/${roadmapId}/tasks/relations`,
    { data: relation },
  );
  return successful(response.status);
};

const addSynergyRelations = async (
  roadmapId: number,
  from: number,
  to: number[],
) => {
  const response = await axios.post(
    `/roadmaps/${roadmapId}/tasks/relations/synergies`,
    { from, to },
  );
  return successful(response.status);
};

const leaveRoadmap = async (roadmapId: number) => {
  const response = await axios.post(`/roadmaps/${roadmapId}/leaveRoadmap`, {
    roadmapId,
  });
  return successful(response.status);
};

const sendPasswordResetLink = async (email: string) => {
  const response = await axios.post('/users/sendPasswordResetLink', {
    email,
  });
  return response.status === 200;
};

const resetPassword = async (token: string, password: string) => {
  const response = await axios.post('/users/resetPassword', {
    token,
    password,
  });
  return response.status === 200;
};

export const api = {
  getRoadmaps,
  addRoadmap,
  deleteRoadmap,
  addTask,
  deleteTask,
  addTaskratings,
  deleteTaskrating,
  login,
  logout,
  register,
  patchUser,
  deleteUser,
  getCurrentUserInfo,
  getCurrentUserToken,
  generateCurrentUserToken,
  deleteCurrentUserToken,
  patchTask,
  getCustomers,
  addCustomer,
  deleteCustomer,
  deleteRoadmapUser,
  patchCustomer,
  patchRoadmapUser,
  getRoadmapUsers,
  patchTaskratings,
  getVersions,
  addVersion,
  patchVersion,
  deleteVersion,
  getIntegrations,
  getIntegrationBoards,
  getIntegrationBoardLabels,
  importIntegrationBoard,
  getIntegrationOauthURL,
  swapIntegrationOAuthToken,
  addIntegrationConfiguration,
  patchIntegrationConfiguration,
  sendNotification,
  patchDefaultRoadmap,
  getInvitations,
  getInvitation,
  sendInvitation,
  patchInvitation,
  deleteInvitation,
  joinRoadmap,
  verifyEmail,
  sendEmailVerificationLink,
  addTaskRelation,
  removeTaskRelation,
  addSynergyRelations,
  leaveRoadmap,
  sendPasswordResetLink,
  resetPassword,
};
