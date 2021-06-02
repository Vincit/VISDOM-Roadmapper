import {
  TaskRatingDimension,
  UserType,
  RoleType,
} from '../../../../shared/types/customTypes';

export interface RoadmapsState {
  roadmaps: Roadmap[] | undefined;
  selectedRoadmapId?: number;
  allUsers: RoadmapUser[] | undefined;
}

export interface Customer {
  id: number;
  roadmapId: number;
  name: string;
  email: string;
  value: number;
  color: string | null;
  representatives?: RoadmapUser[];
}

export interface CustomerRequest {
  id?: number;
  name?: string;
  email?: string | null;
  value?: number;
  color?: string | null;
  representatives?: number[];
}

export interface teamMemberRequest {
  id?: number;
  type?: RoleType | null;
}

export interface PublicUser {
  id: number;
  username: string;
  type: UserType;
}

export interface RoadmapUser {
  id: number;
  username: string;
  type: RoleType;
}

export interface Roadmap {
  id: number;
  name: string;
  description: string;
  tasks: Task[];
  customers: Customer[];
  plannerCustomerWeights: PlannerCustomerWeight[] | undefined;
  jiraconfiguration: JiraConfiguration;
}

export interface RoadmapRequest {
  id?: number;
  name?: string;
  description?: string;
  tasks?: Task[];
}

export interface RoadmapRoleResponse {
  type: RoleType;
  userId: number;
  roadmapId: number;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  roadmapId: number;
  createdAt: string;
  completed: boolean;
  ratings: Taskrating[];
  createdByUser: number;
}

export interface TaskRequest {
  id?: number;
  name?: string;
  description?: string;
  completed?: boolean;
  roadmapId?: number;
  createdByUser?: number;
}

export interface Taskrating {
  id: number;
  dimension: TaskRatingDimension;
  value: number;
  comment: string;
  createdByUser: number;
  forCustomer: number;
  parentTask: number;
}

export interface TaskratingRequest {
  id?: number;
  dimension?: TaskRatingDimension;
  value?: number;
  comment?: string;
  createdByUser?: number;
  forCustomer?: number;
  parentTask?: number;
}

export interface PublicUserRequest {
  id?: number;
  username?: string;
  type?: UserType;
}

export interface GetRoadmapBoardsRequest {
  roadmapId: number;
}

export interface GetRoadmapBoardLabelsRequest {
  roadmapId: number;
  boardId: number;
}

export interface ImportBoardRequest {
  boardId: number;
  createdByUser: number;
  roadmapId: number;
  filters?: {
    labels?: string[];
  };
}

export interface PlannerCustomerWeight {
  customerId: number;
  weight: number;
}
export interface JiraOAuthURLResponse {
  url: URL;
  token: string;
  tokenSecret: string;
}

export interface JiraOAuthURLRequest {
  id: number;
}

export interface JiraTokenSwapRequest {
  id: number;
  verifierToken: string;
  token: string;
  tokenSecret: string;
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
