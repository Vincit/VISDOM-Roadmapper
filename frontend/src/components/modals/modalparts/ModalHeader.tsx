import React from 'react';
import { ModalCloseButton } from '../../forms/SvgButton';
import css from './ModalHeader.module.scss';

export const ModalHeader: React.FC<{ closeModal?: () => void }> = ({
  closeModal,
  children,
}) => (
  <div className={css.container}>
    {children}
    {closeModal && <ModalCloseButton onClick={closeModal} />}
  </div>
);
