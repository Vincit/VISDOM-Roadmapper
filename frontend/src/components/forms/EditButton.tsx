import React from 'react';
import styled from 'styled-components';
import { ReactComponent as EditIcon } from '../../icons/edit_icon.svg';

const StyledEditIcon = styled(EditIcon)<{ type: 'small' | 'large' }>`
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
  href?: string;
}> = ({ type, href, onClick }) => {
  if (href && href.length > 0) {
    return (
      <a href={href}>
        <StyledEditIcon type={type} onClick={onClick} />
      </a>
    );
  }

  return <StyledEditIcon type={type} onClick={onClick} />;
};
