import React, { useCallback, useEffect } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import { StoreDispatchType } from '../../redux';
import { modalsActions } from '../../redux/modals/index';
import { modalStateSelector } from '../../redux/modals/selectors';
import { ModalsState, ModalTypes } from '../../redux/modals/types';
import { RootState } from '../../redux/types';
import { ModalProps } from '../types';
import { AddTaskModal } from './AddTaskModal';
import { AddVersionModal } from './AddVersionModal';
import { EditTaskModal, EditTaskModalProps } from './EditTaskModal';
import { ImportTasksModal } from './ImportTasksModal';
import { JiraOauthModal } from './JiraOauthModal';
import {
  AddJiraConfigurationModal,
  AddJiraConfigurationModalProps,
} from './AddJiraConfigurationModal';
import {
  EditJiraConfigurationModal,
  EditJiraConfigurationModalProps,
} from './EditJiraConfigurationModal';
import { RateTaskModal, RateTaskModalProps } from './RateTaskModal';
import { RateUserModal, RateUserModalProps } from './RateUserModal';
import { TaskInfoModal, TaskInfoModalProps } from './TaskInfoModal';
import {
  TaskRatingsInfoModal,
  TaskRatingsInfoModalProps,
} from './TaskRatingsInfoModal';
import { UserAuthTokenModal } from './UserAuthTokenModal';

type ModalTypeToComponent = {
  [K in ModalTypes]:
    | React.FC<ModalProps>
    | React.FC<RateTaskModalProps>
    | React.FC<EditTaskModalProps>
    | React.FC<TaskInfoModalProps>
    | React.FC<TaskRatingsInfoModalProps>
    | React.FC<RateUserModalProps>
    | React.FC<AddJiraConfigurationModalProps>
    | React.FC<EditJiraConfigurationModalProps>;
};

const Modals: ModalTypeToComponent = {
  [ModalTypes.ADD_TASK_MODAL]: AddTaskModal,
  [ModalTypes.RATE_TASK_MODAL]: RateTaskModal,
  [ModalTypes.EDIT_TASK_MODAL]: EditTaskModal,
  [ModalTypes.TASK_INFO_MODAL]: TaskInfoModal,
  [ModalTypes.TASK_RATINGS_INFO_MODAL]: TaskRatingsInfoModal,
  [ModalTypes.RATE_USER_MODAL]: RateUserModal,
  [ModalTypes.ADD_VERSION_MODAL]: AddVersionModal,
  [ModalTypes.IMPORT_TASKS_MODAL]: ImportTasksModal,
  [ModalTypes.SETUP_OAUTH_MODAL]: JiraOauthModal,
  [ModalTypes.ADD_JIRA_CONFIGURATION_MODAL]: AddJiraConfigurationModal,
  [ModalTypes.EDIT_JIRA_CONFIGURATION_MODAL]: EditJiraConfigurationModal,
  [ModalTypes.USER_AUTH_TOKEN_MODAL]: UserAuthTokenModal,
};

const modalCustomStyles = {
  content: {
    top: '35%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    minWidth: '540px',
    maxWidth: '80vw',
    maxHeight: '80vh',
    borderRadius: '20px',
    boxShadow: '0px 10px 20px 0px rgba(0,0,0,0.25)',
  },
};

Modal.setAppElement('#root');
export const ModalRoot = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const modalsState = useSelector<RootState, ModalsState>(
    modalStateSelector,
    shallowEqual,
  );
  const history = useHistory();
  const { pathname, search } = useLocation();
  const ChosenModal = Modals[modalsState.currentModal] as React.FC<ModalProps>;

  const onRequestClose = useCallback(() => {
    dispatch(modalsActions.hideModal());
    // Remove query params from url when modal is closed
    history.replace(pathname);
  }, [dispatch, pathname, history]);

  useEffect(() => {
    // Add query params to url on open
    if (!modalsState.showModal) return;
    let queryString = `?openModal=${modalsState.currentModal}`;
    if (modalsState.modalProps) {
      queryString += `&modalProps=${encodeURIComponent(
        JSON.stringify(modalsState.modalProps),
      )}`;
    }
    if (!search.includes(queryString)) history.replace(pathname + queryString);
  }, [
    modalsState.showModal,
    modalsState.modalProps,
    modalsState.currentModal,
    history,
    pathname,
    search,
  ]);

  if (!modalsState.showModal) return null;
  return (
    <Modal
      isOpen
      shouldCloseOnOverlayClick={false}
      onRequestClose={onRequestClose}
      style={modalCustomStyles}
    >
      <ChosenModal closeModal={onRequestClose} {...modalsState.modalProps} />
    </Modal>
  );
};
