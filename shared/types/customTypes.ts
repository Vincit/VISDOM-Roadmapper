export enum TaskRelationType {
  Dependency,
  Synergy,
}

export enum TaskStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
}

export enum TaskRatingDimension {
  BusinessValue = 0,
  Complexity = 1,
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
  TaskComplexityRate = 1 << 10,

  VersionCreate = 1 << 11,
  VersionEdit = 1 << 12,
  VersionDelete = 1 << 13,
  VersionRead = 1 << 14,

  RoadmapEdit = 1 << 15,
  RoadmapDelete = 1 << 16,
  RoadmapEditRoles = 1 << 17,
  RoadmapReadUsers = 1 << 18,
  RoadmapReadCustomerValues = 1 << 19,

  CustomerRepresent = 1 << 20,

  IntegrationConfigurationEdit = 1 << 21,

  RoadmapInvite = 1 << 22,

  EditRelations = 1 << 23,
}

export enum RoleType {
  Admin = Permission.All,
  Developer = Permission.TaskRead |
    Permission.TaskRate |
    Permission.TaskCreate |
    Permission.TaskRatingEdit |
    Permission.TaskComplexityRate |
    Permission.VersionRead |
    Permission.RoadmapReadUsers |
    Permission.EditRelations,
  Business = Permission.TaskRead |
    Permission.TaskCreate |
    Permission.TaskEdit |
    Permission.TaskDelete |
    Permission.TaskRate |
    Permission.TaskRatingEdit |
    Permission.TaskValueRate |
    Permission.CustomerRepresent |
    Permission.RoadmapReadUsers |
    Permission.EditRelations |
    Permission.VersionRead |
    Permission.RoadmapReadCustomerValues,
}
