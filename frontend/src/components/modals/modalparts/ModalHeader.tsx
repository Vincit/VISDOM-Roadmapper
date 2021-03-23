import React from 'react';
import css from './ModalHeader.module.scss';

export const ModalHeader: React.FC = ({ children }) => {
  return <div className={css.container}>{children}</div>;
};
