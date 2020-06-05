export enum ModalTypes {
  ADD_TASK_MODAL = 'ADD_TASK_MODAL',
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
