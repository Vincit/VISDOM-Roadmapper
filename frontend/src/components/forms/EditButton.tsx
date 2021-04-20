import React from 'react';
import EditIcon from '@material-ui/icons/Edit';

export const EditButton: React.FC<{
  type: 'small' | 'large';
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ type, href, onClick }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <EditIcon
          onClick={onClick}
          style={{
            opacity: 0.25,
            width: type === 'small' ? '16px' : '24px',
            height: type === 'small' ? '16px' : '24px',
            cursor: 'pointer',
            fill: 'black',
            color: 'black',
          }}
        />
      </a>
    );
  }

  return (
    <EditIcon
      onClick={onClick}
      style={{
        opacity: 0.25,
        width: type === 'small' ? '16px' : '24px',
        height: type === 'small' ? '16px' : '24px',
        cursor: 'pointer',
        fill: 'black',
        color: 'black',
      }}
    />
  );
};
