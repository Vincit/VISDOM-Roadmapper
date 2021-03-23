import React from 'react';
import css from './ModalContent.module.scss';

export interface ModalContentProps {
  overflowAuto?: boolean;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  overflowAuto,
}) => {
  return (
    <div
      className={css.container}
      style={{ overflowY: overflowAuto ? 'auto' : 'inherit' }}
    >
      {children}
    </div>
  );
};
