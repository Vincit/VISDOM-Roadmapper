import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../types';
import { UserInfo } from './types';
import { getType } from '../../utils/UserUtils';

export const userInfoSelector = (state: RootState): UserInfo | undefined =>
  state.user.info;

export const userRoleSelector = createSelector(
  (state: RootState) => state.user.info,
  (state) => state.roadmaps.selectedRoadmapId,
  getType,
);
