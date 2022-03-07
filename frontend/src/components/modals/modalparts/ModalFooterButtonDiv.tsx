import { FC } from 'react';

export const ModalFooterButtonDiv: FC<{ empty?: boolean }> = ({
  children,
  empty,
}) => {
  return (
    <div
      style={{
        flexGrow: empty ? 0 : 1,
        flexBasis: 1,
        maxWidth: '210px',
      }}
    >
      {!empty && children}
    </div>
  );
};
