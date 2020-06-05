import React, { useCallback } from 'react';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { ModalProps } from './types';
import { AddTaskModal } from './AddTaskModal';
import { ModalsState, ModalTypes } from '../redux/modals/types';
import { modalStateSelector } from '../redux/modals/selectors';
import { RootState } from '../redux/types';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals/index';

type ModalTypeToComponent = {
  [K in ModalTypes]: React.FC<ModalProps>;
};

const Modals: ModalTypeToComponent = {
  [ModalTypes.ADD_TASK_MODAL]: AddTaskModal,
};

export const ModalRoot = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const modalsState = useSelector<RootState, ModalsState>(
    modalStateSelector,
    shallowEqual,
  );
  const ChosenModal: React.FC<ModalProps> = Modals[modalsState.currentModal];

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
