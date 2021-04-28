import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import classNames from 'classnames';
import { ReactComponent as CornerPiece } from '../icons/corner_rounder.svg';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';
import { RoadmapSelectorWidget } from './RoadmapSelectorWidget';
import { UserHotSwapWidget } from './UserHotSwapWidget';
import css from './NavBar.module.scss';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';

const classes = classNames.bind(css);

export const NavBar = () => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <div className={classes(css.navBarDiv)}>
      <CornerPiece />
      <div className={classes(css.navBarRightSide)}>
        {!userInfo && (
          <div className={classes(css.loginNavBar)}>
            <VisdomLogo
              className={classes(css.visdomLogo)}
              onClick={() => {
                history.push(paths.home);
              }}
            />
            <span />
            {pathname.startsWith(paths.loginPage) ? (
              <Link
                className={classes(css['button-small-filled'])}
                to={paths.loginPage}
              >
                <Trans i18nKey="Register" />
              </Link>
            ) : (
              <Link
                className={classes(css['button-small-filled'])}
                to={paths.loginPage}
              >
                <Trans i18nKey="Login" />
              </Link>
            )}
          </div>
        )}
        {userInfo && (
          <>
            <div className={classes(css.navBarText)}>
              <Trans i18nKey="Viewing as" />
            </div>
            <UserHotSwapWidget />
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
        )}
      </div>
    </div>
  );
};
