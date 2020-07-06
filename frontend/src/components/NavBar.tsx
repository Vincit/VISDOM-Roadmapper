import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import { RoadmapSelectorWidget } from './RoadmapSelectorWidget';

const Styles = styled.div`
  .navbar-nav {
    width: 100%;
    justify-content: flex-end;
  }

  .navbar {
    width: 100%;
  }

  .bottomborder {
    border: 0px;
    border-bottom: 1px solid black;
  }
`;

export const NavBar = () => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  return (
    <Styles>
      <Navbar className="bottomborder">
        <Navbar.Brand href={paths.home}>VISDOM</Navbar.Brand>
        <Nav>
          <Nav.Link as={Link} to={paths.home}>
            <Trans i18nKey="Home" />
          </Nav.Link>
          {!userInfo && (
            <Nav.Link as={Link} to={paths.loginPage}>
              <Trans i18nKey="Login" />
            </Nav.Link>
          )}
          {userInfo && (
            <>
              <Nav.Link as={Link} to={paths.logoutPage}>
                <Trans i18nKey="Logout" />
              </Nav.Link>
              <Nav.Link as={Link} to={paths.userInfo}>
                <Trans i18nKey="UserInfo" />
              </Nav.Link>
              <RoadmapSelectorWidget />
            </>
          )}
        </Nav>
      </Navbar>
    </Styles>
  );
};
