import React, { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Modal, { ModalProvider } from 'styled-react-modal';
import { StoreDispatchType } from '../../redux';
import { modalsActions } from '../../redux/modals/index';
import { modalStateSelector } from '../../redux/modals/selectors';
import { ModalsState, ModalTypes } from '../../redux/modals/types';
import { RootState } from '../../redux/types';
import { ModalProps } from '../types';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal, EditTaskModalProps } from './EditTaskModal';
import { LoginModal, LoginModalProps } from './LoginModal';
import { RateTaskModal, RateTaskModalProps } from './RateTaskModal';
import { TaskInfoModal, TaskInfoModalProps } from './TaskInfoModal';

type ModalTypeToComponent = {
  [K in ModalTypes]:
    | React.FC<ModalProps>
    | React.FC<RateTaskModalProps>
    | React.FC<LoginModalProps>
    | React.FC<EditTaskModalProps>
    | React.FC<TaskInfoModalProps>;
};

const Modals: ModalTypeToComponent = {
  [ModalTypes.ADD_TASK_MODAL]: AddTaskModal,
  [ModalTypes.LOGIN_MODAL]: LoginModal,
  [ModalTypes.RATE_TASK_MODAL]: RateTaskModal,
  [ModalTypes.EDIT_TASK_MODAL]: EditTaskModal,
  [ModalTypes.TASK_INFO_MODAL]: TaskInfoModal,
};

const StyledModal = Modal.styled`
  position: absolute;
  top: 15%;
  background-color: white;
  min-width: 500px;
  max-width: 80vw;
  max-height: 80vh;
  border: 1px solid black;
  border-radius: 8px;
`;

export const ModalRoot = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const modalsState = useSelector<RootState, ModalsState>(
    modalStateSelector,
    shallowEqual,
  );
  const ChosenModal = Modals[modalsState.currentModal] as React.FC<ModalProps>;

  const onRequestClose = useCallback(() => {
    dispatch(modalsActions.hideModal());
  }, [dispatch]);

  return (
    <ModalProvider>
      {modalsState.showModal && (
        <StyledModal isOpen onEscapeKeydown={onRequestClose}>
          <ChosenModal
            closeModal={onRequestClose}
            {...modalsState.modalProps}
          />
        </StyledModal>
      )}
    </ModalProvider>
  );
};
