import { createSlice } from '@reduxjs/toolkit';
import { ModalsState, ModalTypes } from './types';
import { SHOW_MODAL, HIDE_MODAL } from './reducers';

const initialState: ModalsState = {
  showModal: false,
  currentModal: ModalTypes.ADD_TASK_MODAL,
};

export const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    showModal: SHOW_MODAL,
    hideModal: HIDE_MODAL,
  },
  extraReducers: () => {},
});

export const modalsActions = { ...modalsSlice.actions };
