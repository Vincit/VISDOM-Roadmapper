import { FC } from 'react';
import css from './ModalContent.module.scss';

export interface ModalContentProps {
  overflowAuto?: boolean;
  gap?: string | number;
}

export const ModalContent: FC<ModalContentProps> = ({
  children,
  overflowAuto,
  gap,
}) => {
  return (
    <div
      className={css.container}
      style={{ gap, overflowY: overflowAuto ? 'auto' : 'inherit' }}
    >
      {children}
    </div>
  );
};
