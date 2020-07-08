import styled from 'styled-components';

export const ModalContent = styled.div<{ overflowAuto?: boolean }>`
  display: flex;
  flex-direction: column;
  margin: 32px;
  overflow-y: ${(props) => (props.overflowAuto ? 'auto' : 'inherit')};
`;
