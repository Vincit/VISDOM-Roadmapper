import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { ModalsState, ShowModalPayload } from './types';

export const SHOW_MODAL: CaseReducer<
  ModalsState,
  PayloadAction<ShowModalPayload>
> = (state, action) => {
  state.showModal = true;
  state.currentModal = action.payload.modalType;
  state.modalProps = action.payload.modalProps;
};

export const HIDE_MODAL: CaseReducer<ModalsState, PayloadAction<void>> = (
  state,
) => {
  state.showModal = false;
};
