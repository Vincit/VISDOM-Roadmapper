import { createSlice } from '@reduxjs/toolkit';
import { notifyUsers, leaveRoadmap } from './actions';
import {
  SELECT_CURRENT_ROADMAP,
  CLEAR_CURRENT_ROADMAP,
  SET_TASKMAP_POSITION,
  CLEAR_TASKMAP_POSITION,
  SET_FROM_MILESTONES_EDITOR,
  CLEAR_FROM_MILESTONES_EDITOR,
} from './reducers';
import { RoadmapsState } from './types';

const initialState: RoadmapsState = {
  selectedRoadmapId: null,
  taskmapPosition: undefined,
  fromMilestonesEditor: false,
};

export const roadmapsSlice = createSlice({
  name: 'roadmaps',
  initialState,
  reducers: {
    selectCurrentRoadmap: SELECT_CURRENT_ROADMAP,
    clearCurrentRoadmap: CLEAR_CURRENT_ROADMAP,
    setTaskmapPosition: SET_TASKMAP_POSITION,
    clearTaskmapPosition: CLEAR_TASKMAP_POSITION,
    setFromMilestonesEditor: SET_FROM_MILESTONES_EDITOR,
    clearFromMilestonesEditor: CLEAR_FROM_MILESTONES_EDITOR,
  },
});

export const roadmapsActions = {
  ...roadmapsSlice.actions,
  notifyUsers,
  leaveRoadmap,
};
