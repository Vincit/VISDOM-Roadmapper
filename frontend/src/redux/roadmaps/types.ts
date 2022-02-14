import {
  TaskRatingDimension,
  RoleType,
  TaskRelationType,
} from '../../../../shared/types/customTypes';

export interface RoadmapsState {
  selectedRoadmapId?: number;
  taskmapPosition: TaskmapPosition | undefined;
}

export interface Customer {
  id: number;
  roadmapId: number;
  name: string;
  email: string;
  weight: number;
  color: string;
  representatives?: RoadmapUser[];
}

export interface CustomerRequest {
  id?: number;
  name?: string;
  email?: string;
  weight?: number;
  color?: string;
  representatives?: number[];
}

export interface RoadmapCreationCustomer {
  name: string;
  email: string;
  color: string;
  representatives: (InviteRoadmapUser & { checked: boolean })[];
}

export interface CustomerStakes {
  id: number;
  name: string;
  value: number;
  color: string;
}

export interface CheckableUserWithCustomers extends CheckableUser {
  customers?: Customer[];
}

export interface CheckableCustomer extends Customer {
  checked: boolean;
}

export interface CheckableUser extends RoadmapUser {
  checked: boolean;
}

export interface RoadmapUser {
  id: number;
  email: string;
  type: RoleType;
}

export interface InviteRoadmapUser {
  email: string;
  type: RoleType;
}

export interface RoadmapUserRequest {
  id?: number;
  type?: RoleType | null;
}

export interface Roadmap {
  id: number;
  name: string;
  description: string;
  invitations: Invitation[] | undefined;
  integrations: IntegrationConfiguration[];
}

export interface RoadmapRequest {
  id?: number;
  name?: string;
  description?: string;
  tasks?: Task[];
}

export interface RoadmapCreation {
  roadmap: RoadmapRequest;
  invitations: InviteRoadmapUser[];
  customers: RoadmapCreationCustomer[];
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

export interface TaskRelation {
  from: number;
  to: number;
  type: TaskRelationType;
}

export interface GetRoadmapBoardsRequest {
  roadmapId: number;
  name: string;
}

export interface GetRoadmapBoardLabelsRequest {
  roadmapId: number;
  name: string;
  boardId: string;
}

export interface ImportBoardRequest {
  name: string;
  boardId: string;
  createdByUser: number;
  roadmapId: number;
  filters?: {
    labels?: string[];
  };
}

export interface OAuthURLResponse {
  url: URL;
  token: string;
  tokenSecret: string;
}

export interface OAuthTokenSwapRequest {
  id: number;
  verifierToken: string;
  token: string;
  tokenSecret: string;
}

interface IntegrationBase {
  name: string;
  host?: string;
  consumerkey: string;
  privatekey: string;
  roadmapId: number;
}

export interface IntegrationConfigurationRequest extends IntegrationBase {
  id?: number;
}

export interface IntegrationConfiguration extends IntegrationBase {
  id: number;
}

export interface Version {
  roadmapId: number;
  id: number;
  name: string;
  tasks: Task[];
  sortingRank: number;
}

export interface VersionRequest {
  roadmapId: number;
  id?: number;
  name?: string;
  tasks?: number[];
  sortingRank?: number;
}

export interface AddTaskToVersionRequest {
  task: TaskRequest;
  version: VersionRequest;
  index: number;
}

export interface RemoveTaskFromVersionRequest {
  task: TaskRequest;
  version: VersionRequest;
}

export interface Invitation {
  id: string;
  roadmapId: number;
  type: RoleType;
  email: string;
  updatedAt: string;
  valid: boolean;
  roadmap?: { name: string };
  representativeFor: Customer[];
}

export interface InvitationRequest {
  id: string;
  roadmapId?: number;
  type?: RoleType;
  email?: string;
  representativeFor?: number[];
}

export interface NewInvitation {
  roadmapId?: number;
  type: RoleType;
  email: string;
  representativeFor?: number[];
}

interface InfoModalColumn {
  header: string;
  text: string;
}

export interface InfoModalContent {
  subHeader?: string;
  columns: InfoModalColumn[];
}

export interface TaskmapPosition {
  zoom: number;
  x: number;
  y: number;
}
