import { RootState } from '../types';
import { UserInfo } from './types';

export const userInfoSelector = (state: RootState): UserInfo => state.user.info;
