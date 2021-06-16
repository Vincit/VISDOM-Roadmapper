/* eslint-disable no-bitwise */
import { Customer } from '../roadmaps/types';
import { RoleType } from '../../../../shared/types/customTypes';

export interface UserInfo {
  username: string;
  email: string;
  id: number;
  type?: RoleType;
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
}
