export interface UserInfo {
  name: string;
  email: string;
  uuid: string;
  group: string;
}

export interface UserState {
  info: UserInfo;
  loggedIn: false;
}

export interface GetUserInfoError {
  message: string;
}
