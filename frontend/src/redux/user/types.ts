export interface UserInfo {
  username: string;
  email: string;
  id: number;
  type: UserType;
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
