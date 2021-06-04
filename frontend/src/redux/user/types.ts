/* eslint-disable no-bitwise */
import { Customer } from '../roadmaps/types';

export interface UserInfo {
  username: string;
  email: string;
  id: number;
  type: UserType;
  representativeFor?: Customer[];
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

export enum UserType {
  BusinessUser = 0,
  DeveloperUser = 1,
  CustomerUser = 2,
  AdminUser = 3,
  TokenUser = 4,
}

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
  type: UserType;
}

export enum Permission {
  Any = 0,
  All = ~0,

  TaskRead = 1 << 0,
  TaskCreate = 1 << 1,
  TaskEdit = 1 << 2,
  TaskEditOthers = 1 << 3,
  TaskDelete = 1 << 4,
  TaskRate = 1 << 5,

  TaskRatingRead = 1 << 6,
  TaskRatingEdit = 1 << 7,
  TaskRatingEditOthers = 1 << 8,

  TaskValueRate = 1 << 9,
  TaskWorkRate = 1 << 10,

  VersionCreate = 1 << 11,
  VersionEdit = 1 << 12,
  VersionDelete = 1 << 13,
  VersionRead = 1 << 14,

  RoadmapEdit = 1 << 15,
  RoadmapDelete = 1 << 16,
  RoadmapEditRoles = 1 << 17,
  RoadmapReadUsers = 1 << 18,

  CustomerRepresent = 1 << 20,

  JiraConfigurationEdit = 1 << 19,
}

export enum RoleType {
  Admin = Permission.All,
  Developer = Permission.TaskRead |
    Permission.TaskRate |
    Permission.TaskCreate |
    Permission.TaskRatingEdit |
    Permission.TaskWorkRate |
    Permission.VersionRead |
    Permission.RoadmapReadUsers,
  Customer = Permission.TaskRead |
    Permission.TaskRate |
    Permission.TaskRatingEdit |
    Permission.TaskValueRate,
  Business = RoleType.Customer | Permission.CustomerRepresent,
}
