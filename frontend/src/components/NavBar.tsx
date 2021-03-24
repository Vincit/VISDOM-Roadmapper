import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import { ReactComponent as CornerPiece } from '../icons/corner_rounder.svg';
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
  border-left: 1px solid #e3e3e3;
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
  padding-right: 10px;
  color: black;
  :hover {
    color: black;
  }
`;

const NavbarText = styled.div`
  display: flex;
  align-items: center;
  font-family: Work Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  padding-left: 16px;
  padding-right: 16px;
  color: 696969;
  }
`;

export const NavBar = () => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  return (
    <NavbarDiv style={{ backgroundColor: '#f5f5f5' }}>
      <CornerPiece />
      <NavBarRightSide>
        {!userInfo && (
          <NavbarLink as={Link} to={paths.loginPage}>
            <Trans i18nKey="Login" />
          </NavbarLink>
        )}
        {userInfo && (
          <>
            <NavbarText>
              <Trans i18nKey="Viewing as" />
            </NavbarText>
            <UserHotSwapWidget />
            <NavbarText>
              <Trans i18nKey="Project" />
            </NavbarText>
            <RoadmapSelectorWidget />
            <NavbarDivider />
            <NavbarLink as={Link} to={paths.userInfo}>
              <PermIdentityIcon style={{ color: '#C6C6C6' }} />
            </NavbarLink>
            <NavbarLink as={Link} to={paths.logoutPage}>
              <PowerSettingsNewIcon style={{ color: '#C6C6C6' }} />
            </NavbarLink>
          </>
        )}
      </NavBarRightSide>
    </NavbarDiv>
  );
};
