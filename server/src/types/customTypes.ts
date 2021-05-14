import { Context, Next } from 'koa';

export interface RouteHandlerFnc {
  (ctx: Context, next: Next): Promise<void>;
}

export const enum TaskRatingDimension {
  BusinessValue = 0,
  RequiredWork = 1,
}

export const enum UserType {
  BusinessUser = 0,
  DeveloperUser = 1,
  CustomerUser = 2,
  AdminUser = 3,
  TokenUser = 4,
}

export const enum Permission {
  Any = 0,
  All = ~0,

  TaskRead = 1 << 0,
  TaskCreate = 1 << 1,
  TaskEdit = 1 << 2,
  TaskEditOthers = 1 << 3,
  TaskDelete = 1 << 4,
  TaskRate = 1 << 5,

  VersionCreate = 1 << 6,
  VersionEdit = 1 << 7,
  VersionDelete = 1 << 8,
  VersionRead = 1 << 9,

  RoadmapEdit = 1 << 10,
  RoadmapDelete = 1 << 11,
  RoadmapEditRoles = 1 << 12,
  RoadmapReadUsers = 1 << 13,
}

export enum RoleType {
  Admin = Permission.All,
  Developer = Permission.TaskRead |
    Permission.TaskRate |
    Permission.TaskCreate |
    Permission.VersionRead |
    Permission.RoadmapReadUsers,
  Customer = Permission.TaskRead | Permission.TaskRate,
  Business = RoleType.Customer,
}
