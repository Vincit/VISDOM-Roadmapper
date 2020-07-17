import React from 'react';
import styled from 'styled-components';
import { ReactComponent as InfoIcon } from '../../icons/info_icon.svg';

const StyledInfoIcon = styled(InfoIcon)`
  width: 24px;
  height: 24px;
  cursor: pointer;
`;

export const InfoButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  href?: string;
}> = ({ onClick, href }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <StyledInfoIcon onClick={onClick} />
      </a>
    );
  }
  return <StyledInfoIcon onClick={onClick} />;
};
