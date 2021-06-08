import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { modalsSlice } from './modals';
import { roadmapsSlice } from './roadmaps';
import { userSlice, userActions } from './user';
import { versionsSlice } from './versions';

const appReducer = combineReducers({
  user: userSlice.reducer,
  roadmaps: roadmapsSlice.reducer,
  modals: modalsSlice.reducer,
  versions: versionsSlice.reducer,
});

const rootReducer: typeof appReducer = (state, action) => {
  if (userActions.logout.fulfilled.match(action)) {
    // clear all state on logout
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type StoreDispatchType = typeof store.dispatch;
