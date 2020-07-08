import React from 'react';
import { TrashFill } from 'react-bootstrap-icons';
import styled from 'styled-components';

const StyledDeleteIcon = styled(TrashFill)`
  path {
    fill: black;
    opacity: 0.25;
  }
  width: 22px;
  height: 22px;
  padding: 1px;
  cursor: pointer;
`;

export const DeleteButton: React.FC<{
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}> = ({ onClick }) => {
  return <StyledDeleteIcon onClick={onClick} />;
};
