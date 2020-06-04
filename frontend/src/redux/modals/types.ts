export enum ModalTypes {
  ADD_TASK_MODAL = 'ADD_TASK_MODAL',
}

export interface ModalsState {
  showModal: boolean;
  currentModal: ModalTypes;
}
