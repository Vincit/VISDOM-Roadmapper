import React from 'react';
import styled from 'styled-components';

const CloseButton = styled.div`
  margin: 0;
  padding: 0;
  background-color: transparent;
  color: black;
  border: 0;
  font-size: 36px;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  span {
    margin: auto;
    position: relative;
    top: -4px;
    user-select: none;
  }
`;

const CloseButtonDiv = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export interface ModalCloseButtonProps {
  onClick?: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => void | undefined;
}

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClick,
}) => {
  return (
    <CloseButtonDiv>
      <CloseButton onClick={onClick}>
        <span>&times;</span>
      </CloseButton>
    </CloseButtonDiv>
  );
};
