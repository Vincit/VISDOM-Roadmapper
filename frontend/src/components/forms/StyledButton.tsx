import styled from 'styled-components';

interface StyledButtonProps {
  buttonType: 'submit' | 'cancel' | 'ratenow';
  fullWidth?: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  border-radius: 16px;
  font-size: 14px;
  padding: 8px;
  padding-left: ${(props) => {
    switch (props.buttonType) {
      case 'ratenow':
        return '16px';
      default:
        return '32px';
    }
  }};
  padding-right: ${(props) => {
    switch (props.buttonType) {
      case 'ratenow':
        return '16px';
      default:
        return '32px';
    }
  }};
  text-transform: uppercase;
  height: ${(props) => {
    switch (props.buttonType) {
      default:
        return '32px';
    }
  }};

  text-align: center;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  color: white;
  width: ${(props) => (props.fullWidth ? '100%' : 'initial')};
  border: 0px;
  background-color: ${(props) => {
    switch (props.buttonType) {
      case 'submit':
        return '#202020';
      case 'cancel':
        return '#aaaaaa';
      case 'ratenow':
        return '#202020';
      default:
        return 'black';
    }
  }};

  ::selection,
  :focus {
    border: 0;
    border-color: rgba(0, 0, 0, 255);
    box-shadow: 0 0 0 0;
    outline: 0;
  }

  :hover {
    border: 0;
    border-color: rgba(0, 0, 0, 255);
    box-shadow: 0 0 0 0;
    outline: 0;
    transform: translateY(-2px);
  }

  :hover:after {
    background-color: rgba(0, 0, 0, 0.2);
  }

  :active {
    border: 0;
    border-color: rgba(0, 0, 0, 255);
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 1);
    transform: translateY(-2px);
    outline: 0;
  }
`;
