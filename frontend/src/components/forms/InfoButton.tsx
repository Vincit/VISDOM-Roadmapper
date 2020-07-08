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
}> = ({ onClick }) => {
  return <StyledInfoIcon onClick={onClick} />;
};
