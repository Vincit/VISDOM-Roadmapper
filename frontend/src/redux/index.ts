import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { modalsSlice } from './modals';
import { roadmapsSlice } from './roadmaps';
import { userSlice } from './user';
import { versionsSlice } from './versions';

const rootReducer = combineReducers({
  user: userSlice.reducer,
  roadmaps: roadmapsSlice.reducer,
  modals: modalsSlice.reducer,
  versions: versionsSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type StoreDispatchType = typeof store.dispatch;
