import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { userSlice } from './user';
import { roadmapsSlice } from './roadmaps';

const rootReducer = combineReducers({
  user: userSlice.reducer,
  roadmaps: roadmapsSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type StoreDispatchType = typeof store.dispatch;
