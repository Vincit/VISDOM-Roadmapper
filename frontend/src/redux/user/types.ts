export interface UserInfo {
  name: String;
  email: String;
  uuid: String;
  group: String;
}

export interface UserState {
  info: UserInfo;
  loggedIn: false;
}

export interface GetUserInfoError {
  message: string;
}
