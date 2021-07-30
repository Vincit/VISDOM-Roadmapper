import { FC } from 'react';
import css from './ModalContent.module.scss';

export interface ModalContentProps {
  overflowAuto?: boolean;
}

export const ModalContent: FC<ModalContentProps> = ({
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
