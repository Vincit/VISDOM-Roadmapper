import { FormControl } from 'react-bootstrap';
import styled from 'styled-components';

interface StyledFormControlProps {
  isTextArea?: boolean;
}

export const StyledFormControl = styled(FormControl)<StyledFormControlProps>`
  border: 0;
  border-radius: 8px;
  background-color: #f3f3f3;
  width: 100%;
  padding: 8px;
  color: black;
  min-height: 3em;
  max-height: 25em;
  font-size: 14px;
  height: ${(props) => (props.isTextArea ? '6em' : 'initial')};
  :focus {
    border-color: rgba(50, 50, 50, 0.45);
    border-style: solid;
    border-width: 1px;
    box-shadow: 0 0 0 0;
    background-color: #f8f8f8;
    outline: 0;
  }
`;
