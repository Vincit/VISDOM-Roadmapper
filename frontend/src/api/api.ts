import { createApi, BaseQueryFn } from '@reduxjs/toolkit/query/react';
import Axios, { AxiosRequestConfig, AxiosError } from 'axios';
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

export const axiosBaseQuery: BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data'];
  },
  unknown,
  { status: number | undefined; data: any }
> = async (query) => {
  try {
    const { data } = await axios(query);
    return { data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: { status: err.response?.status, data: err.response?.data },
    };
  }
};

export const selectById = <Id, T extends { id: Id }, Rest>(
  idToFind: Id | undefined,
) => ({
  selectFromResult: ({ data, ...rest }: { data?: T[] } & Rest) => ({
    ...rest,
    data: data?.find(({ id }) => id === idToFind),
  }),
});

export const apiV2 = createApi({
  reducerPath: 'apiV2',
  baseQuery: axiosBaseQuery,
  tagTypes: [
    'Customers',
    'Tasks',
    'Versions',
    'Roadmaps',
    'Invitations',
    'Integrations',
    'Users',
    'Taskrelations',
  ],
  endpoints: (build) => ({
    getCustomers: build.query<Customer[], number>({
      providesTags: ['Customers'],
      query: (roadmapId) => ({
        url: `roadmaps/${roadmapId}/customers`,
        method: 'get',
      }),
    }),
    deleteCustomer: build.mutation<
      void,
      { roadmapId: number; customer: CustomerRequest }
    >({
      invalidatesTags: ['Customers'],
      query: ({ roadmapId, customer }) => ({
        url: `roadmaps/${roadmapId}/customers/${customer.id}`,
        method: 'delete',
      }),
    }),
    patchCustomer: build.mutation<
      Customer,
      { roadmapId: number; customer: CustomerRequest }
    >({
      invalidatesTags: ['Customers'],
      query: ({ roadmapId, customer }) => ({
        url: `roadmaps/${roadmapId}/customers/${customer.id}`,
        method: 'patch',
        data: customer,
      }),
    }),
    addCustomer: build.mutation<
      Customer,
      { roadmapId: number; customer: CustomerRequest }
    >({
      invalidatesTags: ['Customers'],
      query: ({ roadmapId, customer }) => ({
        url: `roadmaps/${roadmapId}/customers/`,
        method: 'post',
        data: customer,
      }),
    }),
    getTasks: build.query<Task[], number>({
      providesTags: ['Tasks'],
      query: (roadmapId) => ({
        url: `roadmaps/${roadmapId}/tasks?eager=1`,
        method: 'get',
      }),
    }),
    deleteTask: build.mutation<void, { roadmapId: number; task: TaskRequest }>({
      invalidatesTags: ['Tasks'],
      query: ({ roadmapId, task }) => ({
        url: `roadmaps/${roadmapId}/tasks/${task.id}`,
        method: 'delete',
      }),
    }),
    patchTask: build.mutation<Task, { roadmapId: number; task: TaskRequest }>({
      invalidatesTags: ['Tasks'],
      query: ({ roadmapId, task }) => ({
        url: `roadmaps/${roadmapId}/tasks/${task.id}`,
        method: 'patch',
        data: task,
      }),
    }),
    addTask: build.mutation<Task, { roadmapId: number; task: TaskRequest }>({
      invalidatesTags: ['Tasks'],
      query: ({ roadmapId, task }) => ({
        url: `roadmaps/${roadmapId}/tasks/`,
        method: 'post',
        data: task,
      }),
    }),
    deleteTaskrating: build.mutation<
      void,
      { roadmapId: number; rating: TaskratingRequest }
    >({
      invalidatesTags: ['Tasks'],
      query: ({ roadmapId, rating }) => ({
        url: `/roadmaps/${roadmapId}/tasks/${rating.parentTask}/taskratings/${rating.id}`,
        method: 'delete',
      }),
    }),
    patchTaskratings: build.mutation<
      Taskrating[],
      { roadmapId: number; taskId: number; ratings: TaskratingRequest[] }
    >({
      invalidatesTags: ['Tasks'],
      query: ({ roadmapId, taskId, ratings }) => ({
        url: `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
        method: 'patch',
        data: ratings,
      }),
    }),
    addTaskratings: build.mutation<
      Taskrating[],
      { roadmapId: number; taskId: number; ratings: TaskratingRequest[] }
    >({
      invalidatesTags: ['Tasks'],
      query: ({ roadmapId, taskId, ratings }) => ({
        url: `/roadmaps/${roadmapId}/tasks/${taskId}/taskratings`,
        method: 'post',
        data: ratings,
      }),
    }),
    getVersions: build.query<Version[], number>({
      providesTags: ['Versions'],
      query: (roadmapId) => ({
        url: `roadmaps/${roadmapId}/versions`,
        method: 'get',
      }),
      transformResponse: (res: Version[]) =>
        res.sort((a, b) => a.sortingRank - b.sortingRank),
    }),
    deleteVersion: build.mutation<void, VersionRequest>({
      invalidatesTags: ['Versions'],
      query: (version) => ({
        url: `/roadmaps/${version.roadmapId}/versions/${version.id}`,
        method: 'delete',
      }),
    }),
    patchVersion: build.mutation<Version, VersionRequest>({
      invalidatesTags: ['Versions'],
      query: ({ roadmapId, id, name, tasks, sortingRank }) => ({
        url: `/roadmaps/${roadmapId}/versions/${id}/`,
        method: 'patch',
        data: { name, tasks, sortingRank },
      }),
    }),
    addVersion: build.mutation<Version, VersionRequest>({
      invalidatesTags: ['Versions'],
      query: (version) => ({
        url: `/roadmaps/${version.roadmapId}/versions/`,
        method: 'post',
        data: version,
      }),
    }),
    getRoadmaps: build.query<Roadmap[], void>({
      providesTags: ['Roadmaps'],
      query: () => ({ url: `roadmaps?eager=1`, method: 'get' }),
    }),
    deleteRoadmap: build.mutation<void, RoadmapRequest>({
      invalidatesTags: ['Roadmaps'],
      query: (roadmap) => ({
        url: `/roadmaps/${roadmap.id}`,
        method: 'delete',
      }),
    }),
    addRoadmap: build.mutation<Roadmap, RoadmapRequest>({
      invalidatesTags: ['Roadmaps'],
      query: (roadmap) => ({ url: '/roadmaps', method: 'post', data: roadmap }),
      transformResponse: ({ integrations, ...rest }: Roadmap) => ({
        integrations: integrations ?? [],
        ...rest,
      }),
    }),
    getInvitations: build.query<Invitation[], number>({
      providesTags: ['Invitations'],
      query: (roadmapId) => ({
        url: `roadmaps/${roadmapId}/invitations/`,
        method: 'get',
      }),
    }),
    sendInvitation: build.mutation<
      Invitation,
      { roadmapId: number; invitation: NewInvitation }
    >({
      invalidatesTags: ['Invitations'],
      query: ({ roadmapId, invitation }) => ({
        url: `roadmaps/${roadmapId}/invitations/`,
        method: 'post',
        data: invitation,
      }),
    }),
    patchInvitation: build.mutation<
      Invitation,
      { roadmapId: number; invitation: InvitationRequest }
    >({
      invalidatesTags: ['Invitations'],
      query: ({ roadmapId, invitation }) => ({
        url: `roadmaps/${roadmapId}/invitations/${invitation.id}`,
        method: 'patch',
        data: invitation,
      }),
    }),
    deleteInvitation: build.mutation<void, { roadmapId: number; id: string }>({
      invalidatesTags: ['Invitations'],
      query: ({ roadmapId, id }) => ({
        url: `roadmaps/${roadmapId}/invitations/${id}`,
        method: 'delete',
      }),
    }),
    addIntegrationConfiguration: build.mutation<
      IntegrationConfiguration,
      IntegrationConfigurationRequest
    >({
      invalidatesTags: ['Integrations', 'Roadmaps'],
      query: (configuration) => ({
        url: `roadmaps/${configuration.roadmapId}/integrations/${configuration.name}/configuration`,
        method: 'post',
        data: configuration,
      }),
    }),
    patchIntegrationConfiguration: build.mutation<
      IntegrationConfiguration,
      IntegrationConfigurationRequest
    >({
      invalidatesTags: ['Integrations', 'Roadmaps'],
      query: ({ roadmapId, name, id, host, consumerkey, privatekey }) => ({
        url: `roadmaps/${roadmapId}/integrations/${name}/configuration/${id}`,
        method: 'patch',
        data: { host, consumerkey, privatekey },
      }),
    }),
    getIntegrations: build.query<Integrations, number>({
      providesTags: ['Integrations'],
      query: (roadmapId) => ({
        url: `roadmaps/${roadmapId}/integrations/`,
        method: 'get',
      }),
    }),
    getIntegrationBoards: build.query<
      IntegrationBoard[],
      GetRoadmapBoardsRequest
    >({
      providesTags: ['Integrations'],
      query: ({ name, roadmapId }) => ({
        url: `roadmaps/${roadmapId}/integrations/${name}/boards`,
        method: 'get',
      }),
    }),
    getIntegrationBoardLabels: build.query<
      string[],
      GetRoadmapBoardLabelsRequest
    >({
      providesTags: ['Integrations'],
      query: ({ name, roadmapId, boardId }) => ({
        url: `roadmaps/${roadmapId}/integrations/${name}/boards/${boardId}/labels`,
        method: 'get',
      }),
    }),
    importIntegrationBoard: build.mutation<void, ImportBoardRequest>({
      invalidatesTags: ['Integrations', 'Tasks'],
      query: (request) => ({
        url: `roadmaps/${request.roadmapId}/integrations/${request.name}/boards/${request.boardId}/import`,
        method: 'post',
        data: request,
      }),
    }),
    getRoadmapUsers: build.query<RoadmapUser[], number>({
      providesTags: ['Users'],
      query: (roadmapId) => ({
        url: `roadmaps/${roadmapId}/users`,
        method: 'get',
      }),
    }),
    patchRoadmapUsers: build.mutation<
      RoadmapRoleResponse,
      { roadmapId: number; user: RoadmapUserRequest }
    >({
      invalidatesTags: ['Users'],
      query: ({ roadmapId, user }) => ({
        url: `roadmaps/${roadmapId}/users/${user.id}/roles`,
        method: 'patch',
        data: user,
      }),
    }),
    deleteRoadmapUser: build.mutation<
      void,
      { roadmapId: number; user: RoadmapUserRequest }
    >({
      invalidatesTags: ['Users'],
      query: ({ roadmapId, user }) => ({
        url: `roadmaps/${roadmapId}/users/${user.id}/roles`,
        method: 'delete',
      }),
    }),
    getTaskRelations: build.query<TaskRelation[], number>({
      providesTags: ['Taskrelations'],
      query: (roadmapId) => ({
        url: `/roadmaps/${roadmapId}/tasks/relations`,
        method: 'get',
      }),
    }),
    addTaskRelation: build.mutation<
      void,
      { roadmapId: number; relation: TaskRelation }
    >({
      invalidatesTags: ['Taskrelations'],
      query: ({ roadmapId, relation }) => ({
        url: `/roadmaps/${roadmapId}/tasks/relations`,
        method: 'post',
        data: relation,
      }),
    }),
    removeTaskRelation: build.mutation<
      void,
      { roadmapId: number; relation: TaskRelation }
    >({
      invalidatesTags: ['Taskrelations'],
      query: ({ roadmapId, relation }) => ({
        url: `/roadmaps/${roadmapId}/tasks/relations`,
        method: 'delete',
        data: relation,
      }),
    }),
    addSynergyRelations: build.mutation<
      void,
      { roadmapId: number; from: number; to: number[] }
    >({
      invalidatesTags: ['Taskrelations'],
      query: ({ roadmapId, from, to }) => ({
        url: `/roadmaps/${roadmapId}/tasks/relations/synergies`,
        method: 'post',
        data: { from, to },
      }),
    }),
    refetchTasks: build.mutation<null, null>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Tasks'],
    }),
    refetchRoadmaps: build.mutation<null, null>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Roadmaps'],
    }),
    refetchUsers: build.mutation<null, null>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Users'],
    }),
    refetchCustomers: build.mutation<null, null>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Customers'],
    }),
    refetchTaskrelations: build.mutation<null, null>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Taskrelations'],
    }),
    refetchVersions: build.mutation<null, null>({
      queryFn: () => ({ data: null }),
      invalidatesTags: ['Versions'],
    }),
  }),
});

const getInvitation = async (invitationId: string) => {
  const response = await axios.get(`users/join/${invitationId}`);
  return response.data as Invitation;
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
  return successful(response.status);
};

const resetPassword = async (token: string, password: string) => {
  const response = await axios.post('/users/resetPassword', {
    token,
    password,
  });
  return successful(response.status);
};

export const api = {
  login,
  logout,
  register,
  patchUser,
  deleteUser,
  getCurrentUserInfo,
  getCurrentUserToken,
  generateCurrentUserToken,
  deleteCurrentUserToken,
  getIntegrationOauthURL,
  swapIntegrationOAuthToken,
  sendNotification,
  patchDefaultRoadmap,
  getInvitation,
  joinRoadmap,
  verifyEmail,
  sendEmailVerificationLink,
  leaveRoadmap,
  sendPasswordResetLink,
  resetPassword,
};
