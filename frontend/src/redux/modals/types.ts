export enum ModalTypes {
  ADD_TASK_MODAL = 'ADD_TASK_MODAL',
  LOGIN_MODAL = 'LOGIN_MODAL',
}

export interface ShowModalPayload {
  modalType: ModalTypes;
  modalProps: Object;
}

export interface ModalsState {
  showModal: boolean;
  currentModal: ModalTypes;
  modalProps: Object;
}
