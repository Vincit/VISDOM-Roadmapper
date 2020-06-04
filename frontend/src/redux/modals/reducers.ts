import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { ModalTypes, ModalsState } from './types';

export const SHOW_MODAL: CaseReducer<ModalsState, PayloadAction<ModalTypes>> = (
  state,
  action,
) => {
  state.showModal = true;
  state.currentModal = action.payload;
};

export const HIDE_MODAL: CaseReducer<ModalsState, PayloadAction<void>> = (
  state,
) => {
  state.showModal = false;
};
