import { RoleType } from "../types/customTypes";

export const hasPermission = (type: RoleType | undefined, permission: number) =>
  type !== undefined && (type & permission) === permission;
