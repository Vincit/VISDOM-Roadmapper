import { combineReducers, configureStore, Action } from '@reduxjs/toolkit';
import {
  withReduxStateSync,
  createStateSyncMiddleware,
  initStateWithPrevTab,
} from 'redux-state-sync';
import { modalsSlice } from './modals';
import { roadmapsSlice } from './roadmaps';
import { userSlice, userActions } from './user';
import { versionsSlice } from './versions';
import { apiV2 } from '../api/api';

const appReducer = combineReducers({
  user: userSlice.reducer,
  roadmaps: roadmapsSlice.reducer,
  modals: modalsSlice.reducer,
  versions: versionsSlice.reducer,
  apiV2: apiV2.reducer,
});

const rootReducer: typeof appReducer = (state, action) => {
  if (
    userActions.logout.fulfilled.match(action) ||
    userActions.deleteUser.fulfilled.match(action)
  ) {
    // clear all state on logout or account deletion
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const stateSyncConfig = {
  // all actions except modal actions will be synchronized
  predicate: (action: Action) =>
    !modalsSlice.actions.hideModal.match(action) &&
    !modalsSlice.actions.showModal.match(action),
};

export const store = configureStore({
  reducer: withReduxStateSync(rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiV2.middleware as any,
      createStateSyncMiddleware(stateSyncConfig),
    ),
});

initStateWithPrevTab(store);

export type StoreDispatchType = any; // typeof store.dispatch;
