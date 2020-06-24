import React from 'react';
import { Trans } from 'react-i18next';
import { Navbar, Nav } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { paths } from '../routers/paths';

const Styles = styled.div`
  .navbar-nav {
    width: 100%;
    justify-content: flex-end;
  }

  .bottomborder {
    border: 0px;
    border-bottom: 1px solid black;
  }
`;

export const NavBar = () => {
  return (
    <Styles>
      <Navbar className="bottomborder">
        <Navbar.Brand href={paths.home}>VISDOM</Navbar.Brand>
        <Nav>
          <Nav.Link as={Link} to={paths.home}>
            <Trans i18nKey="Home" />
          </Nav.Link>
          <Nav.Link as={Link} to={paths.userInfo}>
            <Trans i18nKey="UserInfo" />
          </Nav.Link>{' '}
          <Nav.Link as={Link} to={paths.roadmapHome}>
            <Trans i18nKey="Roadmap" />
          </Nav.Link>
        </Nav>
      </Navbar>
    </Styles>
  );
};
