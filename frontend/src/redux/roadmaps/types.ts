import { UserType } from '../user/types';

export interface RoadmapsState {
  roadmaps: Roadmap[] | undefined;
  selectedRoadmapId?: number;
  allUsers: PublicUser[] | undefined;
}

export interface PublicUser {
  id: number;
  username: string;
  type: UserType;
  customerValue?: number;
}

export interface Roadmap {
  id: number;
  name: string;
  description: string;
  tasks: Task[];
  plannerUserWeights: PlannerUserWeight[] | undefined;
  jiraconfiguration: JiraConfiguration;
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
  createdAt: string;
  completed: boolean;
  ratings: Taskrating[];
  relatedTasks: number[];
  createdByUser: number;
}

export interface TaskRequest {
  id?: number;
  name?: string;
  description?: string;
  completed?: boolean;
  roadmapId?: number;
  createdByUser?: number;
  relatedTasks?: TaskRequest[];
}

export enum TaskRatingDimension {
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

export interface RelatedTaskRequest {
  fromTask: number;
  toTask: number;
}

export interface RelatedTaskResponsePayload {
  newRelatedTasks: number[];
  parentTaskId: number;
}

export interface PublicUserRequest {
  id?: number;
  username?: string;
  type?: UserType;
  customerValue?: number;
}

export interface ImportBoardRequest {
  boardId: number;
  createdByUser: number;
  roadmapId: number;
}

export interface PlannerUserWeight {
  userId: number;
  weight: number;
}
export interface JiraOAuthURLResponse {
  url: URL;
  token: string;
  token_secret: string;
}

export interface JiraTokenSwapRequest {
  verifierToken: string;
  token: string;
  token_secret: string;
}

export interface JiraConfigurationRequest {
  id?: number;
  url: string;
  privatekey: string;
  roadmapId: number;
}

export interface JiraConfiguration {
  id: number;
  roadmapId: number;
  url: string;
  privatekey: string;
}
