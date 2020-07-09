export enum ModalTypes {
  ADD_TASK_MODAL = 'ADD_TASK_MODAL',
  LOGIN_MODAL = 'LOGIN_MODAL',
  RATE_TASK_MODAL = 'RATE_TASK_MODAL',
  EDIT_TASK_MODAL = 'EDIT_TASK_MODAL',
  TASK_INFO_MODAL = 'TASK_INFO_MODAL',
  TASK_RATINGS_INFO_MODAL = 'TASK_RATINGS_INFO_MODAL',
  RATE_USER_MODAL = 'RATE_USER_MODAL',
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
