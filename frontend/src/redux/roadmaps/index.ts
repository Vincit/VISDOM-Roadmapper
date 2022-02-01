import { createSlice } from '@reduxjs/toolkit';
import { notifyUsers, leaveRoadmap } from './actions';
import {
  SELECT_CURRENT_ROADMAP,
  CLEAR_CURRENT_ROADMAP,
  SET_TASKMAP_POSITION,
  CLEAR_TASKMAP_POSITION,
} from './reducers';
import { RoadmapsState } from './types';

const initialState: RoadmapsState = {
  selectedRoadmapId: undefined,
  taskmapPosition: undefined,
};

export const roadmapsSlice = createSlice({
  name: 'roadmaps',
  initialState,
  reducers: {
    selectCurrentRoadmap: SELECT_CURRENT_ROADMAP,
    clearCurrentRoadmap: CLEAR_CURRENT_ROADMAP,
    setTaskmapPosition: SET_TASKMAP_POSITION,
    clearTaskmapPosition: CLEAR_TASKMAP_POSITION,
  },
});

export const roadmapsActions: any = {
  ...roadmapsSlice.actions,
  notifyUsers,
  leaveRoadmap,
};
