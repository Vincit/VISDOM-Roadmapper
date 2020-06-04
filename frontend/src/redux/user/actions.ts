import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserInfo } from './types';

export const getUserInfo = createAsyncThunk(
  'user/getUserInfoStatus',
  async () => {
    return {
      name: 'Test user',
      email: 'test@email.com',
      uuid: '1234567890abcdef',
      group: 'TestGroup',
    } as UserInfo;
  },
);
