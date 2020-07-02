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
  height: ${(props) => (props.isTextArea ? '6em' : 'initial')};
  :focus {
    border: 0;
    border-color: rgba(0, 0, 0, 255);
    box-shadow: 0 0 0 1pt rgba(75, 75, 75, 0.65);
    background-color: #f8f8f8;
    outline: 0;
  }
`;
