export enum ModalTypes {
  ADD_TASK_MODAL = 'ADD_TASK_MODAL',
  RATE_TASK_MODAL = 'RATE_TASK_MODAL',
  EDIT_TASK_MODAL = 'EDIT_TASK_MODAL',
  TASK_INFO_MODAL = 'TASK_INFO_MODAL',
  TASK_RATINGS_INFO_MODAL = 'TASK_RATINGS_INFO_MODAL',
  RATE_USER_MODAL = 'RATE_USER_MODAL',
  ADD_VERSION_MODAL = 'ADD_VERSION_MODAL',
  IMPORT_TASKS_MODAL = 'IMPORT_TASKS_MODAL',
  SETUP_OAUTH_MODAL = 'SETUP_OATH_MODAL',
}

export interface ShowModalPayload {
  modalType: ModalTypes;
  modalProps: { [K in any]: any };
}

export interface ModalsState {
  showModal: boolean;
  currentModal: ModalTypes;
  modalProps: { [K in any]: any };
}
