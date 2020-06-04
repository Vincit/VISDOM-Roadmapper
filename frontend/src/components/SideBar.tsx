import React from 'react';
import styled from 'styled-components';
import { Nav, Col } from 'react-bootstrap';

const Sidebar = styled(Col)`
  display: block;
  min-width: 130px !important;
  max-width: 130px !important;
  min-height: 100%;
  border-right: solid 1px #000;
`;

export const SideBar = () => {
  return (
    <>
      <Sidebar>
        <Nav>
          <Nav.Link href="#">Link 1</Nav.Link>
          <Nav.Link href="#">Link 2</Nav.Link>
        </Nav>
      </Sidebar>
    </>
  );
};
