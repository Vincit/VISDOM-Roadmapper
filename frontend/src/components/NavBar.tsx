import React from 'react';
import { Trans } from 'react-i18next';
import { Navbar, Nav } from 'react-bootstrap';
import styled from 'styled-components';
import { paths } from '../router/paths';

const Styles = styled.div`
  .navbar-nav {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const NavBar = () => {
  return (
    <Styles>
      <Navbar>
        <Navbar.Brand href={paths.home}>VISDOM</Navbar.Brand>
        <Nav>
          <Nav.Link href={paths.home}>
            <Trans i18nKey="User" />
          </Nav.Link>
          <Nav.Link href={paths.userInfo}>
            <Trans i18nKey="UserInfo" />
          </Nav.Link>
        </Nav>
      </Navbar>
    </Styles>
  );
};
