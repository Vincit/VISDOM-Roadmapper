import { createSlice } from '@reduxjs/toolkit';
import {
  addOrPatchTaskrating,
  addRoadmap,
  addTask,
  addTaskrating,
  addTaskratings,
  deleteRoadmap,
  deleteTask,
  deleteTaskrating,
  getCustomers,
  addCustomer,
  deleteCustomer,
  deleteRoadmapUser,
  patchCustomer,
  patchRoadmapUser,
  getRoadmapUsers,
  getRoadmaps,
  importIntegrationBoard,
  patchTask,
  patchTaskratings,
  patchTaskrating,
  addIntegrationConfiguration,
  patchIntegrationConfiguration,
  addTaskToVersion,
  addVersion,
  deleteVersion,
  getVersions,
  patchVersion,
  removeTaskFromVersion,
  notifyUsers,
  sendInvitation,
  getInvitations,
  patchInvitation,
  deleteInvitation,
} from './actions';
import {
  ADD_ROADMAP_FULFILLED,
  ADD_TASKRATING_FULFILLED,
  ADD_TASKRATINGS_FULFILLED,
  ADD_TASK_FULFILLED,
  DELETE_ROADMAP_FULFILLED,
  DELETE_TASKRATING_FULFILLED,
  DELETE_TASK_FULFILLED,
  GET_CUSTOMERS_FULFILLED,
  ADD_CUSTOMER_FULFILLED,
  PATCH_CUSTOMER_FULFILLED,
  PATCH_ROADMAP_USER_FULFILLED,
  DELETE_CUSTOMER_FULFILLED,
  DELETE_ROADMAP_USER_FULFILLED,
  GET_ROADMAP_USERS_FULFILLED,
  GET_ROADMAPS_FULFILLED,
  PATCH_TASKRATINGS_FULFILLED,
  PATCH_TASKRATING_FULFILLED,
  PATCH_TASK_FULFILLED,
  SELECT_CURRENT_ROADMAP,
  CLEAR_CURRENT_ROADMAP,
  ADD_INTEGRATION_CONFIGURATION_FULFILLED,
  PATCH_INTEGRATION_CONFIGURATION_FULFILLED,
  ADD_VERSION_FULFILLED,
  GET_VERSIONS_FULFILLED,
  PATCH_VERSION_FULFILLED,
  DELETE_VERSION_FULFILLED,
  GET_INVITATIONS_FULFILLED,
  PATCH_INVITATION_FULFILLED,
  DELETE_INVITATION_FULFILLED,
} from './reducers';
import { RoadmapsState } from './types';

const initialState: RoadmapsState = {
  roadmaps: undefined,
  selectedRoadmapId: undefined,
};

export const roadmapsSlice = createSlice({
  name: 'roadmaps',
  initialState,
  reducers: {
    selectCurrentRoadmap: SELECT_CURRENT_ROADMAP,
    clearCurrentRoadmap: CLEAR_CURRENT_ROADMAP,
  },
  extraReducers: (builder) => {
    builder.addCase(getRoadmaps.fulfilled, GET_ROADMAPS_FULFILLED);
    builder.addCase(addRoadmap.fulfilled, ADD_ROADMAP_FULFILLED);
    builder.addCase(deleteRoadmap.fulfilled, DELETE_ROADMAP_FULFILLED);
    builder.addCase(addTask.fulfilled, ADD_TASK_FULFILLED);
    builder.addCase(deleteTask.fulfilled, DELETE_TASK_FULFILLED);
    builder.addCase(addTaskrating.fulfilled, ADD_TASKRATING_FULFILLED);
    builder.addCase(addTaskratings.fulfilled, ADD_TASKRATINGS_FULFILLED);
    builder.addCase(deleteTaskrating.fulfilled, DELETE_TASKRATING_FULFILLED);
    builder.addCase(patchTask.fulfilled, PATCH_TASK_FULFILLED);
    builder.addCase(getCustomers.fulfilled, GET_CUSTOMERS_FULFILLED);
    builder.addCase(patchCustomer.fulfilled, PATCH_CUSTOMER_FULFILLED);
    builder.addCase(patchRoadmapUser.fulfilled, PATCH_ROADMAP_USER_FULFILLED);
    builder.addCase(addCustomer.fulfilled, ADD_CUSTOMER_FULFILLED);
    builder.addCase(deleteCustomer.fulfilled, DELETE_CUSTOMER_FULFILLED);
    builder.addCase(deleteRoadmapUser.fulfilled, DELETE_ROADMAP_USER_FULFILLED);
    builder.addCase(getRoadmapUsers.fulfilled, GET_ROADMAP_USERS_FULFILLED);
    builder.addCase(patchTaskratings.fulfilled, PATCH_TASKRATINGS_FULFILLED);
    builder.addCase(patchTaskrating.fulfilled, PATCH_TASKRATING_FULFILLED);
    builder.addCase(importIntegrationBoard.fulfilled, GET_ROADMAPS_FULFILLED);
    builder.addCase(
      addIntegrationConfiguration.fulfilled,
      ADD_INTEGRATION_CONFIGURATION_FULFILLED,
    );
    builder.addCase(
      patchIntegrationConfiguration.fulfilled,
      PATCH_INTEGRATION_CONFIGURATION_FULFILLED,
    );
    builder.addCase(addVersion.fulfilled, ADD_VERSION_FULFILLED);
    builder.addCase(getVersions.fulfilled, GET_VERSIONS_FULFILLED);
    builder.addCase(patchVersion.fulfilled, PATCH_VERSION_FULFILLED);
    builder.addCase(deleteVersion.fulfilled, DELETE_VERSION_FULFILLED);
    builder.addCase(getInvitations.fulfilled, GET_INVITATIONS_FULFILLED);
    builder.addCase(patchInvitation.fulfilled, PATCH_INVITATION_FULFILLED);
    builder.addCase(deleteInvitation.fulfilled, DELETE_INVITATION_FULFILLED);
  },
});

export const roadmapsActions = {
  ...roadmapsSlice.actions,
  deleteTaskrating,
  addTaskrating,
  addTaskratings,
  deleteTask,
  addTask,
  deleteRoadmap,
  addRoadmap,
  getRoadmaps,
  getCustomers,
  addCustomer,
  deleteCustomer,
  deleteRoadmapUser,
  patchCustomer,
  patchRoadmapUser,
  getRoadmapUsers,
  patchTask,
  patchTaskratings,
  patchTaskrating,
  addOrPatchTaskrating,
  importIntegrationBoard,
  addIntegrationConfiguration,
  patchIntegrationConfiguration,
  addVersion,
  getVersions,
  patchVersion,
  deleteVersion,
  addTaskToVersion,
  removeTaskFromVersion,
  notifyUsers,
  sendInvitation,
  getInvitations,
  patchInvitation,
  deleteInvitation,
};
