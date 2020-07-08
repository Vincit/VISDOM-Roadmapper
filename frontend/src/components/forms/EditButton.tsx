import React from 'react';
import styled from 'styled-components';
import { ReactComponent as EditIcon } from '../../icons/edit_icon.svg';

const StyledEditICon = styled(EditIcon)<{ type: 'small' | 'large' }>`
  path {
    fill: black;
    opacity: 0.25;
  }
  width: ${(props) => (props.type === 'small' ? '1.5em' : '24px')};
  height: ${(props) => (props.type === 'small' ? '1.5em' : '24px')};
  cursor: pointer;
`;

export const EditButton: React.FC<{
  type: 'small' | 'large';
  onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}> = ({ type, onClick }) => {
  return <StyledEditICon type={type} onClick={onClick} />;
};
