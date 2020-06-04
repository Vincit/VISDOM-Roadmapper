import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { userSlice } from './user';
import { roadmapsSlice } from './roadmaps';
import { modalsSlice } from './modals';

const rootReducer = combineReducers({
  user: userSlice.reducer,
  roadmaps: roadmapsSlice.reducer,
  modals: modalsSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type StoreDispatchType = typeof store.dispatch;
