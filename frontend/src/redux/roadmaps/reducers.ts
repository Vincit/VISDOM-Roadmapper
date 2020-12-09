import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  PlannerUserWeight,
  PublicUser,
  RelatedTaskResponsePayload,
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

export const ADD_RELATED_TASK_FULFILLED = (
  state: RoadmapsState,
  action: PayloadAction<RelatedTaskResponsePayload>,
) => {
  let parentTask: Task | undefined;
  if (!state.roadmaps) throw new Error('Roadmaps havent been fetched yet');
  state.roadmaps.forEach((roadmap) => {
    if (parentTask !== undefined) return;
    parentTask = roadmap.tasks.find(
      (task) => task.id === action.payload.parentTaskId,
    );
  });

  if (parentTask) {
    parentTask.relatedTasks = action.payload.newRelatedTasks;
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

export const SET_PLANNER_USER_WEIGHT: CaseReducer<RoadmapsState, PayloadAction<PlannerUserWeight>> = (state, action) => {
  const selectedRoadmap = state.roadmaps?.find(roadmap => roadmap.id === state.selectedRoadmapId);
  if (!selectedRoadmap) throw new Error('No roadmap has been selected');
  const newUserWeights = selectedRoadmap.plannerUserWeights || [];
  const existing = newUserWeights.find(userWeight => userWeight.userId === action.payload.userId);
  if (existing) Object.assign(existing, action.payload);
  if (!existing){
    newUserWeights.push(action.payload);
  }
  selectedRoadmap.plannerUserWeights = newUserWeights;
}