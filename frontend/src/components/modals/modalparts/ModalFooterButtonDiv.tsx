import styled from 'styled-components';

interface ModalFooterButtonDivProps {
  rightmargin?: boolean;
}
export const ModalFooterButtonDiv = styled.div<ModalFooterButtonDivProps>`
  width: 100%;
  margin-right: ${(props) => (props.rightmargin ? '16px' : '0px')};
`;
