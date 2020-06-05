export interface RoadmapsState {
  roadmaps: Roadmap[];
  selectedRoadmapId?: Number;
}

export interface Roadmap {
  id: Number;
  name: String;
  description: String;
  tasks: Task[];
}

export interface RoadmapRequest {
  id?: Number;
  name?: String;
  description?: String;
  tasks?: Task[];
}

export interface Task {
  id: Number;
  name: String;
  description: String;
  parentRoadmap: Number;
  ratings: Taskrating[];
  relatedTasks: Number[];
}

export interface TaskRequest {
  id?: Number;
  name?: String;
  description?: String;
  parentRoadmap?: Number;
  relatedTasks?: TaskRequest[];
}

export const enum TaskRatingDimension {
  BusinessValue = 0,
  RequiredWork = 1,
}

export interface Taskrating {
  id: Number;
  dimension: TaskRatingDimension;
  value: Number;
  createdByUser: Number;
  parentTask: Number;
}

export interface TaskratingRequest {
  id?: Number;
  dimension?: TaskRatingDimension;
  value?: Number;
  createdByUser?: Number;
  parentTask?: Number;
}

export interface RelatedtaskRequest {
  fromTask: Number;
  toTask: Number;
}

export interface RelatedtaskResponsePayload {
  newRelatedTasks: Number[];
  parentTaskId: Number;
}
