import React from 'react';

interface ModalFooterButtonDivProps {
  rightmargin?: boolean;
  empty?: boolean;
}

export const ModalFooterButtonDiv: React.FC<ModalFooterButtonDivProps> = ({
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
