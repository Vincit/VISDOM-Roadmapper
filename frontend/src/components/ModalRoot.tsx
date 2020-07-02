import React, { useCallback } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { modalStateSelector } from '../redux/modals/selectors';
import { ModalsState, ModalTypes } from '../redux/modals/types';
import { RootState } from '../redux/types';
import { AddTaskModal } from './AddTaskModal';
import { EditTaskModal, EditTaskModalProps } from './EditTaskModal';
import { LoginModal, LoginModalProps } from './LoginModal';
import { RateTaskModal, RateTaskModalProps } from './RateTaskModal';
import { ModalProps } from './types';

type ModalTypeToComponent = {
  [K in ModalTypes]:
    | React.FC<ModalProps>
    | React.FC<RateTaskModalProps>
    | React.FC<LoginModalProps>
    | React.FC<EditTaskModalProps>;
};

const Modals: ModalTypeToComponent = {
  [ModalTypes.ADD_TASK_MODAL]: AddTaskModal,
  [ModalTypes.LOGIN_MODAL]: LoginModal,
  [ModalTypes.RATE_TASK_MODAL]: RateTaskModal,
  [ModalTypes.EDIT_TASK_MODAL]: EditTaskModal,
};

export const ModalRoot = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const modalsState = useSelector<RootState, ModalsState>(
    modalStateSelector,
    shallowEqual,
  );
  const ChosenModal = Modals[modalsState.currentModal] as React.FC<ModalProps>;

  const onClose = useCallback(() => {
    dispatch(modalsActions.hideModal());
  }, [dispatch]);

  return (
    <>
      {modalsState.showModal && (
        <ChosenModal show onClose={onClose} {...modalsState.modalProps} />
      )}
    </>
  );
};
