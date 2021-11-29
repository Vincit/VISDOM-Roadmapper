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

const stateSyncConfig = {
  // all actions except modal actions will be synchronized
  predicate: (action: Action) =>
    !modalsSlice.actions.hideModal.match(action) &&
    !modalsSlice.actions.showModal.match(action),
};

export const store = configureStore({
  reducer: withReduxStateSync(rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createStateSyncMiddleware(stateSyncConfig)),
});

initStateWithPrevTab(store);

export type StoreDispatchType = typeof store.dispatch;
