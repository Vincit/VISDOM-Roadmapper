import styled from 'styled-components';

interface StyledButtonProps {
  buttonType: 'submit' | 'cancel';
  fullWidth?: boolean;
}

export const StyledButton = styled.button<StyledButtonProps>`
  border-radius: 16px;
  height: 40px;
  justify-content: center;
  align-items: center;
  color: white;
  width: ${(props) => (props.fullWidth ? '100%' : 'initial')};
  border: 0px;
  background-color: ${(props) => {
    switch (props.buttonType) {
      case 'submit':
        return '#202020';
      case 'cancel':
        return '#aaaaaa';
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
