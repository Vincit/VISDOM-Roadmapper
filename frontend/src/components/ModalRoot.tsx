import React, { useCallback } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { ModalProps } from './types';
import { AddTaskModal } from './AddTaskModal';
import { ModalsState, ModalTypes } from '../redux/modals/types';
import { modalStateSelector } from '../redux/modals/selectors';
import { RootState } from '../redux/types';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';
import { LoginModal, LoginModalProps } from './LoginModal';
import { RateTaskModal, RateTaskModalProps } from './RateTaskModal';

type ModalTypeToComponent = {
  [K in ModalTypes]:
    | React.FC<ModalProps>
    | React.FC<RateTaskModalProps>
    | React.FC<LoginModalProps>;
};

const Modals: ModalTypeToComponent = {
  [ModalTypes.ADD_TASK_MODAL]: AddTaskModal,
  [ModalTypes.LOGIN_MODAL]: LoginModal,
  [ModalTypes.RATE_TASK_MODAL]: RateTaskModal,
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
