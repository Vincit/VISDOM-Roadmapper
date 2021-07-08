import { createSlice } from '@reduxjs/toolkit';
import { ModalsState, ModalTypes } from '../../components/modals/types';
import { SHOW_MODAL, HIDE_MODAL } from './reducers';

const initialState: ModalsState<any> = {
  showModal: false,
  modalType: ModalTypes.ADD_TASK_MODAL,
  modalProps: {},
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
