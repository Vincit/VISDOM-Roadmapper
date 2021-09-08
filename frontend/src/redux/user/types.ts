import { Customer } from '../roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';

export interface UserInfo {
  username: string;
  email: string;
  emailVerified: boolean;
  id: number;
  roles: RoadmapRole[];
  representativeFor?: Customer[];
  defaultRoadmapId: number | null;
}

export interface RoadmapRole {
  userId: number;
  roadmapId: number;
  type: RoleType;
}

export interface UserState {
  info?: UserInfo;
}

export interface GetUserInfoError {
  message: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
}
