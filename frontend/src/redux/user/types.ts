/* eslint-disable no-bitwise */
import { Customer } from '../roadmaps/types';
import { UserType } from '../../../../shared/types/customTypes';

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

export interface UserRegisterRequest {
  username: string;
  email: string;
  password: string;
  type: UserType;
}
