import { NavDropdown } from 'react-bootstrap';
import styled from 'styled-components';

export const StyledNavDropdown = styled(NavDropdown)`
  border-radius: 16px;
  height: 32px;
  min-width: 12em;
  background-color: black;
  font-size: 14px;
  line-height: 20px;
  margin-top: auto;
  margin-bottom: auto;

  .dropdown-menu {
    width: 100%;
  }

  .dropdown-toggle {
    color: white !important;
    padding: 7px 0px 10px;
  }

  a {
    width: 100%;
    font-size: 14px !important;
    line-height: 20px !important;
    text-decoration: none;
    color: black;
    :hover {
      text-decoration: none;
      color: black;
    }
  }
`;
