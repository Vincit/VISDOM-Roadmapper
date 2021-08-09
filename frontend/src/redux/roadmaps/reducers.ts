import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  PlannerCustomerWeight,
  IntegrationConfiguration,
  Customer,
  CustomerRequest,
  RoadmapUserRequest,
  RoadmapUser,
  RoadmapRoleResponse,
  Roadmap,
  RoadmapRequest,
  RoadmapsState,
  Task,
  Taskrating,
  TaskratingRequest,
  TaskRequest,
  Version,
} from './types';

export const GET_ROADMAPS_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Roadmap[]>,
) => {
  state.roadmaps = action.payload;
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

export const GET_CUSTOMERS_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; customers: Customer[] }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
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
  if (!roadmap.customers) roadmap.customers = [action.payload];
  else roadmap.customers.push(action.payload);
};

export const PATCH_CUSTOMER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<Customer>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;

  const patched = roadmap.customers?.find(({ id }) => id === action.payload.id);
  if (patched) Object.assign(patched, action.payload);
};

export const DELETE_CUSTOMER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; response: CustomerRequest }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.customers = roadmap.customers?.filter(
    ({ id }) => id !== action.payload.response.id,
  );
};

export const GET_ROADMAP_USERS_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; response: RoadmapUser[] }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.users = action.payload.response;
};

export const PATCH_ROADMAP_USER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<RoadmapRoleResponse>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  const patched = roadmap.users.find(({ id }) => id === action.payload.userId);
  Object.assign(patched, { ...patched, type: action.payload.type });
};

export const DELETE_ROADMAP_USER_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; response: RoadmapUserRequest }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.users = roadmap.users.filter(
    ({ id }) => id !== action.payload.response.id,
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

export const CLEAR_CURRENT_ROADMAP: CaseReducer<RoadmapsState> = (state) => {
  state.selectedRoadmapId = undefined;
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

export const CLEAR_PLANNER_CUSTOMER_WEIGHTS: CaseReducer<
  RoadmapsState,
  PayloadAction<void>
> = (state) => {
  const selectedRoadmap = state.roadmaps?.find(
    (roadmap) => roadmap.id === state.selectedRoadmapId,
  );
  if (!selectedRoadmap) throw new Error('No roadmap has been selected');
  selectedRoadmap.plannerCustomerWeights = [];
};

export const ADD_INTEGRATION_CONFIGURATION_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<IntegrationConfiguration>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const parent = state.roadmaps.find(
    (roadmap) => roadmap.id === action.payload.roadmapId,
  )!;
  parent.integrations.push(action.payload);
};

export const PATCH_INTEGRATION_CONFIGURATION_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<IntegrationConfiguration>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const parentRoadmap = state.roadmaps.find(
    (roadmap) => roadmap.id === action.payload.roadmapId,
  );
  const target = parentRoadmap?.integrations.find(
    ({ id }) => id === action.payload.id,
  );
  if (target) {
    Object.assign(target, action.payload);
  }
};

export const GET_VERSIONS_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; response: Version[] }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps?.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.versions = action.payload.response;
};

export const ADD_VERSION_FULFILLED: CaseReducer<
  RoadmapsState,
  PayloadAction<{ roadmapId: number; response: Version[] }>
> = (state, action) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps?.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.versions = action.payload.response;
};

export const PATCH_VERSION_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; response: Version[] }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps?.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.versions = action.payload.response;
};

export const DELETE_VERSION_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<{ roadmapId: number; response: Version[] }>,
) => {
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  const roadmap = state.roadmaps?.find(
    ({ id }) => id === action.payload.roadmapId,
  )!;
  roadmap.versions = action.payload.response;
};
