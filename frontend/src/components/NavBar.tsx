import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import { RoadmapSelectorWidget } from './RoadmapSelectorWidget';
import { UserHotSwapWidget } from './UserHotSwapWidget';

const NavbarDiv = styled.nav`
  position: relative;
  top: 0;
  left: 0;
  height: 56px;
  min-height: 56px;
  width: 100%;
  border: 0;
  display: flex;
  flex-direction: row;
  justify-content: start;
  vertical-align: middle;
  box-sizing: border-box;
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
  margin-left: 16px;
  margin-right: 16px;
  height: 30px;
  margin-top: 13px;
  margin-bottom: 13px;
`;

const NavbarLink = styled(Link)`
  display: flex;
  align-items: center;
  font-family: Work Sans;
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
    <NavbarDiv style={{ borderRadius: 50, backgroundColor: '#f5f5f5' }}>
      <NavBarRightSide>
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
            <UserHotSwapWidget />
            <NavbarDivider />
            <RoadmapSelectorWidget />
          </>
        )}
      </NavBarRightSide>
    </NavbarDiv>
  );
};
