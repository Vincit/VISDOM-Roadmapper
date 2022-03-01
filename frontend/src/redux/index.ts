import {
  combineReducers,
  configureStore,
  Action,
  createAction,
} from '@reduxjs/toolkit';
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

const clearState = createAction('CLEAR_STATE');

const rootReducer: typeof appReducer = (state, action) => {
  if (
    clearState.match(action) ||
    userActions.logout.fulfilled.match(action) ||
    userActions.deleteUser.fulfilled.match(action)
  ) {
    // clear all state on logout, account deletion or explicit request
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

const isUnauthenticatedError = (action: any) => {
  if (action.error && action.payload) {
    const { payload } = action;
    return payload?.isAxiosError
      ? payload?.response?.status === 401
      : payload?.status === 401;
  }
  return false;
};

export const store = configureStore({
  reducer: (withReduxStateSync(rootReducer) as unknown) as typeof appReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ({ dispatch }) => (next) => (action) => {
        if (isUnauthenticatedError(action)) {
          // clear the state on any unauthenticated (401) request
          // as that indicates stale session cookies
          dispatch(clearState());
        } else {
          next(action);
        }
      },
      (createStateSyncMiddleware(stateSyncConfig) as unknown) as ReturnType<
        typeof getDefaultMiddleware
      >[0],
      apiV2.middleware,
    ),
});

initStateWithPrevTab(store);

export type StoreDispatchType = typeof store.dispatch;
