import React from 'react';
import css from './ModalFooter.module.scss';

export const ModalFooter: React.FC = ({ children }) => {
  return <div className={css.container}>{children}</div>;
};
