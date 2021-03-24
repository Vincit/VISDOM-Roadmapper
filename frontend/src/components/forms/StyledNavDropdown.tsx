import { NavDropdown } from 'react-bootstrap';
import styled from 'styled-components';

export const StyledNavDropdown = styled(NavDropdown)`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  padding: 0px;
  border-radius: 16px;
  border: 2px solid #0ec679;
  box-sizing: border-box;
  height: 32px;
  min-width: 12em;
  background-color: white;
  font-size: 12px;
  line-height: 20px;
  margin-top: auto;
  margin-bottom: auto;

  .dropdown-menu {
    width: 100%;
  }

  .dropdown-toggle {
    color: black !important;
    padding: 7px 0px 10px;
  }

  a {
    width: 100%;
    font-size: 12px !important;
    line-height: 18px !important;
    text-decoration: none;
    color: black;
    :hover {
      text-decoration: none;
      color: black;
    }
  }
`;
