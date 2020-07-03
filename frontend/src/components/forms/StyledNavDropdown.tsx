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

  .dropdown-toggle {
    color: white !important;
    padding-bottom: 10px;
    padding: 0;
    padding-top: 7px;
  }
  a {
    font-size: 14px !important;
    line-height: 20px !important;
  }
`;
