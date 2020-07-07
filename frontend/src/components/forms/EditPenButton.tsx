import React from 'react';
import { Pencil } from 'react-bootstrap-icons';
import styled from 'styled-components';

const EditPenIcon = styled(Pencil)`
  width: 1.5em;
  height: 1.5em;
  cursor: pointer;
`;

export const EditPenButton: React.FC<{
  onClick: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}> = ({ onClick }) => {
  return <EditPenIcon onClick={onClick} />;
};
