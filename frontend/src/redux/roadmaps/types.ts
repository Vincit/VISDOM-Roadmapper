export interface RoadmapsState {
  roadmaps: Roadmap[];
  selectedRoadmapId?: number;
}

export interface Roadmap {
  id: number;
  name: string;
  description: string;
  tasks: Task[];
}

export interface RoadmapRequest {
  id?: number;
  name?: string;
  description?: string;
  tasks?: Task[];
}

export interface Task {
  id: number;
  name: string;
  description: string;
  roadmapId: number;
  requiredBy: string;
  createdAt: Date;
  completed: boolean;
  ratings: Taskrating[];
  relatedTasks: number[];
}

export interface TaskRequest {
  id?: number;
  name?: string;
  description?: string;
  completed?: boolean;
  requiredBy?: string;
  roadmapId?: number;
  relatedTasks?: TaskRequest[];
}

export const enum TaskRatingDimension {
  BusinessValue = 0,
  RequiredWork = 1,
}

export interface Taskrating {
  id: number;
  dimension: TaskRatingDimension;
  value: number;
  comment: string;
  createdByUser: number;
  parentTask: number;
}

export interface TaskratingRequest {
  id?: number;
  dimension?: TaskRatingDimension;
  value?: number;
  comment?: string;
  createdByUser?: number;
  parentTask?: number;
}

export interface RelatedtaskRequest {
  fromTask: number;
  toTask: number;
}

export interface RelatedtaskResponsePayload {
  newRelatedTasks: number[];
  parentTaskId: number;
}
