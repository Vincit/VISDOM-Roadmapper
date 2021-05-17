import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  PlannerCustomerWeight,
  JiraConfiguration,
  Customer,
  CustomerRequest,
  PublicUser,
  Roadmap,
  RoadmapRequest,
  RoadmapsState,
  Task,
  Taskrating,
  TaskratingRequest,
  TaskRequest,
} from './types';

export const GET_ROADMAPS_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Roadmap[]>,
) => {
  state.roadmaps = action.payload;
};

export const GET_CUSTOMERS_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; customers: Customer[] }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps?.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.customers = action.payload.customers;
};

export const ADD_CUSTOMER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Customer>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.customers.push(action.payload);
};

export const PATCH_CUSTOMER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Customer>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;

  const patched = roadmap.customers.find(({ id }) => id === action.payload.id);
  Object.assign(patched, action.payload);
};

export const DELETE_CUSTOMER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; response: CustomerRequest }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.customers = roadmap.customers.filter(
    ({ id }) => id !== action.payload.response.id,
  );
};

export const GET_PUBLIC_USERS_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<PublicUser[]>,
) => {
  state.allUsers = action.payload;
};

export const ADD_ROADMAP_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Roadmap>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  state.roadmaps.push(action.payload);
};

export const DELETE_ROADMAP_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<RoadmapRequest>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  state.roadmaps = state.roadmaps.filter(
    (roadmap) => roadmap.id !== action.payload.id,
  );
};

export const ADD_TASK_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Task>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const parent = state.roadmaps.find(
    (roadmap) => roadmap.id === action.payload.roadmapId,
  )!;
  parent.tasks.push(action.payload);
};

export const PATCH_TASK_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Task>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const parent = state.roadmaps.find(
    (roadmap) => roadmap.id === action.payload.roadmapId,
  )!;

  const patchedTask = parent.tasks.find(
    (task) => task.id === action.payload.id,
  );

  Object.assign(patchedTask, action.payload);
};

export const DELETE_TASK_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<TaskRequest>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const parent = state.roadmaps.find(
    (roadmap) => roadmap.id === action.payload.roadmapId,
  )!;
  parent.tasks = parent.tasks.filter((task) => task.id !== action.payload.id);
};

export const ADD_TASKRATING_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Taskrating>,
) => {
  let parentTask: Task | undefined;
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  state.roadmaps.forEach((roadmap) => {
    if (parentTask !== undefined) return;
    parentTask = roadmap.tasks.find(
      (task) => task.id === action.payload.parentTask,
    );
  });

  if (parentTask) {
    parentTask.ratings.push(action.payload);
  }
};

export const PATCH_TASKRATING_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Taskrating>,
) => {
  let parentTask: Task | undefined;
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  state.roadmaps.forEach((roadmap) => {
    if (parentTask !== undefined) return;
    parentTask = roadmap.tasks.find(
      (task) => task.id === action.payload.parentTask,
    );
  });

  if (parentTask) {
    const taskrating = parentTask.ratings.find(
      (rating) => rating.id === action.payload.id,
    );
    Object.assign(taskrating, action.payload);
  }
};

export const DELETE_TASKRATING_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<TaskratingRequest>,
) => {
  let parentTask: Task | undefined;
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  state.roadmaps.forEach((roadmap) => {
    if (parentTask !== undefined) return;
    parentTask = roadmap.tasks.find(
      (task) => task.id === action.payload.parentTask,
    );
  });

  if (parentTask) {
    parentTask.ratings = parentTask.ratings.filter(
      (rating) => rating.id !== action.payload.id,
    );
  }
};

export const SELECT_CURRENT_ROADMAP: CaseReducer<
  RoadmapsState,
  PayloadAction<number>
> = (state, action) => {
  state.selectedRoadmapId = action.payload;
};

export const PATCH_PUBLIC_USER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<PublicUser>,
) => {
  if (!state.allUsers) throw new Error('Users havent been fetched yet');
  const patchUser = state.allUsers.find(
    (user) => user.id === action.payload.id,
  )!;

  Object.assign(patchUser, action.payload);
};

export const SET_PLANNER_CUSTOMER_WEIGHT: CaseReducer<
  RoadmapsState,
  PayloadAction<PlannerCustomerWeight>
> = (state, action) => {
  const selectedRoadmap = state.roadmaps?.find(
    (roadmap) => roadmap.id === state.selectedRoadmapId,
  );
  if (!selectedRoadmap) throw new Error('No roadmap has been selected');
  const weights = selectedRoadmap.plannerCustomerWeights || [];
  const existing = weights.find(
    ({ customerId }) => customerId === action.payload.customerId,
  );
  if (existing) Object.assign(existing, action.payload);
  if (!existing) {
    weights.push(action.payload);
  }
  selectedRoadmap.plannerCustomerWeights = weights;
};

export const ADD_JIRA_CONFIGURATION_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<JiraConfiguration>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const parent = state.roadmaps.find(
    (roadmap) => roadmap.id === action.payload.roadmapId,
  )!;
  parent.jiraconfiguration = action.payload;
};

export const PATCH_JIRA_CONFIGURATION_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<JiraConfiguration>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const parentRoadmap = state.roadmaps.find(
    (roadmap) => roadmap.id === action.payload.roadmapId,
  )!;

  if (parentRoadmap) {
    Object.assign(parentRoadmap.jiraconfiguration, action.payload);
  }
};
