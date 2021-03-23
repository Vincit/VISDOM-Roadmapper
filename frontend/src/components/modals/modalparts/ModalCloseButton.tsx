/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import css from './ModalCloseButton.module.scss';

export interface ModalCloseButtonProps {
  onClick?: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void | undefined;
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClick,
}) => {
  return (
    <div className={css.container}>
      <div className={css['close-button']} onClick={onClick}>
        <CloseIcon />
      </div>
    </div>
  );
};
