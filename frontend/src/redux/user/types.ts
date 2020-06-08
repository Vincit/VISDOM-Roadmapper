export interface UserInfo {
  username: string;
  email: string;
  id: number;
  group: string;
}

export interface UserState {
  info?: UserInfo;
  loggedIn: boolean;
}

export interface GetUserInfoError {
  message: string;
}

export interface UserLoginRequest {
  username: string;
  password: string;
}
