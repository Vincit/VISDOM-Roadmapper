import React from 'react';
import DeleteIcon from '@material-ui/icons/Delete';

export const DeleteButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}> = ({ onClick }) => {
  return (
    <DeleteIcon
      onClick={onClick}
      style={{
        width: 22,
        height: 22,
        padding: 1,
        cursor: 'pointer',
        opacity: 0.25,
      }}
    />
  );
};
