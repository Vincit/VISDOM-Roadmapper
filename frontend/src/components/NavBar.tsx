import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as VisdomIcon } from '../icons/visdom_icon.svg';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import { RoadmapSelectorWidget } from './RoadmapSelectorWidget';

const NavbarDiv = styled.nav`
  position: relative;
  top: 0;
  left: 0;
  height: 56px;
  width: 100%;
  border: 0;
  border-bottom: 1px solid black;
  display: flex;
  flex-direction: row;
  justify-content: start;
  vertical-align: middle;
  box-sizing: border-box;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.08);
`;

const NavbarBrand = styled.a`
  display: flex;
  height: 100%;
  align-items: center;
  font-family: Anonymous Pro;
  font-style: normal;
  font-weight: bold;
  font-size: 11px;
  line-height: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888888;
  cursor: pointer;

  :hover {
    text-decoration: none;
    color: #888888;
  }
`;

const BrandIconDiv = styled.div`
  margin-left: 8px;
  margin-right: 8px;
`;

const NavBarRightSide = styled.div`
  margin-right: 16px;
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: flex-end;
  vertical-align: middle;
`;

const NavbarDivider = styled.div`
  border: 0;
  border-left: 1px solid black;
  width: 0px;
  margin-left: 0;
  margin-right: 16px;
  height: 30px;
  margin-top: 13px;
  margin-bottom: 13px;
`;

const NavbarLink = styled(Link)`
  display: flex;
  align-items: center;
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  padding-left: 16px;
  padding-right: 16px;
  color: black;
  :hover {
    color: black;
  }
`;

export const NavBar = () => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  return (
    <NavbarDiv>
      <NavbarBrand href={paths.home}>
        <BrandIconDiv>
          <VisdomIcon />
        </BrandIconDiv>
        Visdom Roadmap Tool
      </NavbarBrand>
      <NavBarRightSide>
        <NavbarLink to={paths.home}>
          <Trans i18nKey="Home" />
        </NavbarLink>
        {!userInfo && (
          <NavbarLink as={Link} to={paths.loginPage}>
            <Trans i18nKey="Login" />
          </NavbarLink>
        )}
        {userInfo && (
          <>
            <NavbarLink as={Link} to={paths.logoutPage}>
              <Trans i18nKey="Logout" />
            </NavbarLink>
            <NavbarLink as={Link} to={paths.userInfo}>
              <Trans i18nKey="UserInfo" />
            </NavbarLink>
            <NavbarDivider />
            <RoadmapSelectorWidget />
          </>
        )}
      </NavBarRightSide>
    </NavbarDiv>
  );
};
