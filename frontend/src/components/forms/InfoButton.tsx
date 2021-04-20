import React from 'react';
import InfoIcon from '@material-ui/icons/Info';

export const InfoButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ onClick, href }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <InfoIcon
          onClick={onClick}
          style={{
            width: 24,
            height: 24,
            cursor: 'pointer',
            opacity: 0.25,
            fill: 'black',
            color: 'black',
          }}
        />
      </a>
    );
  }
  return (
    <InfoIcon
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        cursor: 'pointer',
        opacity: 0.25,
        fill: 'black',
        color: 'black',
      }}
    />
  );
};
