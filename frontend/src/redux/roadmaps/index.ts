import { createSlice } from '@reduxjs/toolkit';
import {
  addOrPatchTaskrating,
  addRoadmap,
  addTask,
  addTaskrating,
  deleteRoadmap,
  deleteTask,
  deleteTaskrating,
  getCustomers,
  addCustomer,
  deleteCustomer,
  patchCustomer,
  getRoadmapUsers,
  getRoadmaps,
  importJiraBoard,
  patchPublicUser,
  patchTask,
  patchTaskrating,
  addJiraConfiguration,
  patchJiraConfiguration,
} from './actions';
import {
  ADD_ROADMAP_FULFILLED,
  ADD_TASKRATING_FULFILLED,
  ADD_TASK_FULFILLED,
  DELETE_ROADMAP_FULFILLED,
  DELETE_TASKRATING_FULFILLED,
  DELETE_TASK_FULFILLED,
  GET_CUSTOMERS_FULFILLED,
  ADD_CUSTOMER_FULFILLED,
  PATCH_CUSTOMER_FULFILLED,
  DELETE_CUSTOMER_FULFILLED,
  GET_ROADMAP_USERS_FULFILLED,
  GET_ROADMAPS_FULFILLED,
  PATCH_PUBLIC_USER_FULFILLED,
  PATCH_TASKRATING_FULFILLED,
  PATCH_TASK_FULFILLED,
  SELECT_CURRENT_ROADMAP,
  SET_PLANNER_CUSTOMER_WEIGHT,
  ADD_JIRA_CONFIGURATION_FULFILLED,
  PATCH_JIRA_CONFIGURATION_FULFILLED,
} from './reducers';
import { RoadmapsState } from './types';

const initialState: RoadmapsState = {
  roadmaps: undefined,
  selectedRoadmapId: undefined,
  allUsers: undefined,
};

export const roadmapsSlice = createSlice({
  name: 'roadmaps',
  initialState,
  reducers: {
    selectCurrentRoadmap: SELECT_CURRENT_ROADMAP,
    setPlannerCustomerWeight: SET_PLANNER_CUSTOMER_WEIGHT,
  },
  extraReducers: (builder) => {
    builder.addCase(getRoadmaps.fulfilled, GET_ROADMAPS_FULFILLED);
    builder.addCase(addRoadmap.fulfilled, ADD_ROADMAP_FULFILLED);
    builder.addCase(deleteRoadmap.fulfilled, DELETE_ROADMAP_FULFILLED);
    builder.addCase(addTask.fulfilled, ADD_TASK_FULFILLED);
    builder.addCase(deleteTask.fulfilled, DELETE_TASK_FULFILLED);
    builder.addCase(addTaskrating.fulfilled, ADD_TASKRATING_FULFILLED);
    builder.addCase(deleteTaskrating.fulfilled, DELETE_TASKRATING_FULFILLED);
    builder.addCase(patchTask.fulfilled, PATCH_TASK_FULFILLED);
    builder.addCase(getCustomers.fulfilled, GET_CUSTOMERS_FULFILLED);
    builder.addCase(patchCustomer.fulfilled, PATCH_CUSTOMER_FULFILLED);
    builder.addCase(addCustomer.fulfilled, ADD_CUSTOMER_FULFILLED);
    builder.addCase(deleteCustomer.fulfilled, DELETE_CUSTOMER_FULFILLED);
    builder.addCase(getRoadmapUsers.fulfilled, GET_ROADMAP_USERS_FULFILLED);
    builder.addCase(patchTaskrating.fulfilled, PATCH_TASKRATING_FULFILLED);
    builder.addCase(patchPublicUser.fulfilled, PATCH_PUBLIC_USER_FULFILLED);
    builder.addCase(importJiraBoard.fulfilled, GET_ROADMAPS_FULFILLED);
    builder.addCase(
      addJiraConfiguration.fulfilled,
      ADD_JIRA_CONFIGURATION_FULFILLED,
    );
    builder.addCase(
      patchJiraConfiguration.fulfilled,
      PATCH_JIRA_CONFIGURATION_FULFILLED,
    );
  },
});

export const roadmapsActions = {
  ...roadmapsSlice.actions,
  deleteTaskrating,
  addTaskrating,
  deleteTask,
  addTask,
  deleteRoadmap,
  addRoadmap,
  getRoadmaps,
  getCustomers,
  addCustomer,
  deleteCustomer,
  patchCustomer,
  getRoadmapUsers,
  patchTask,
  patchTaskrating,
  addOrPatchTaskrating,
  patchPublicUser,
  importJiraBoard,
  addJiraConfiguration,
  patchJiraConfiguration,
};
