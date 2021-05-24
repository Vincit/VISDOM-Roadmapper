import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import classNames from 'classnames';
import { ReactComponent as CornerPiece } from '../icons/corner_rounder.svg';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import { RoadmapSelectorWidget } from './RoadmapSelectorWidget';
import css from './NavBar.module.scss';
import { LoginNavBar } from './LoginNavBar';

const classes = classNames.bind(css);

export const NavBar = () => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const { pathname } = useLocation();

  return (
    <>
      {!userInfo &&
        (pathname.startsWith(paths.loginPage) ? (
          <LoginNavBar type="login" />
        ) : (
          <LoginNavBar type="register" />
        ))}
      {userInfo && (
        <div className={classes(css.navBarDiv)}>
          <CornerPiece />
          <div className={classes(css.navBarRightSide)}>
            <>
              <div className={classes(css.navBarText)}>
                <Trans i18nKey="Project" />
              </div>
              <RoadmapSelectorWidget />
              <div className={classes(css.navBarDivider)} />
              <Link className={classes(css.navBarLink)} to={paths.userInfo}>
                <PermIdentityIcon className={classes(css.icon)} />
              </Link>
              <Link className={classes(css.navBarLink)} to={paths.logoutPage}>
                <PowerSettingsNewIcon className={classes(css.icon)} />
              </Link>
            </>
          </div>
        </div>
      )}
    </>
  );
};
