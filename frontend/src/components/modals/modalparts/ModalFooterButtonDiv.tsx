import React from 'react';

interface ModalFooterButtonDivProps {
  rightmargin?: boolean;
}

export const ModalFooterButtonDiv: React.FC<ModalFooterButtonDivProps> = ({
  children,
}) => {
  return (
    <div
      style={{
        flexGrow: 1,
        flexBasis: 1,
      }}
    >
      {children}
    </div>
  );
};
