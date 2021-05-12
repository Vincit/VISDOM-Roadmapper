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

  TaskCreate = 1 << 0,
  TaskEdit = 1 << 1,
  TaskDelete = 1 << 2,
  TaskRate = 1 << 3,

  VersionCreate = 1 << 4,
  VersionEdit = 1 << 5,
  VersionDelete = 1 << 6,
  VersionRead = 1 << 7,

  RoadmapEdit = 1 << 8,
  RoadmapDelete = 1 << 9,
  RoadmapEditRoles = 1 << 10,
  RoadmapReadUsers = 1 << 11,
}

export enum RoleType {
  Admin = Permission.All,
  Developer = Permission.TaskRate |
    Permission.TaskCreate |
    Permission.VersionRead,
  Customer = Permission.TaskRate,
  Business = RoleType.Customer,
}
