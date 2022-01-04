import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import StarSharpIcon from '@material-ui/icons/StarSharp';
import BuildSharpIcon from '@material-ui/icons/BuildSharp';
import classNames from 'classnames';
import { ReactComponent as CornerPiece } from '../icons/corner_rounder.svg';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';
import { paths } from '../routers/paths';
import { RoadmapSelectorWidget } from './RoadmapSelectorWidget';
import css from './NavBar.module.scss';
import { findLoginNavBar } from './LoginNavBar';
import { userInfoSelector, userRoleSelector } from '../redux/user/selectors';
import { BusinessIcon } from './RoleIcons';
import { RoleType } from '../../../shared/types/customTypes';

const classes = classNames.bind(css);

export const NavBar = () => {
  const { search, pathname } = useLocation();
  const userInfo = useSelector(userInfoSelector, shallowEqual);
  const userRole = useSelector(userRoleSelector, shallowEqual);
  const loggedIn = !!userInfo;
  const loginNavBar = findLoginNavBar(pathname, loggedIn);
  if (loginNavBar) return loginNavBar({ search });

  return (
    <div className={classes(css.navBarDiv)}>
      <CornerPiece />
      {(pathname.startsWith(paths.overview) ||
        pathname.startsWith('/join')) && (
        <div className={classes(css.logo)}>
          <VisdomLogo />
        </div>
      )}
      <div className={classes(css.navBarRightSide)}>
        <div className={classes(css.navBarText)}>
          <Trans i18nKey="Project" />
        </div>
        <RoadmapSelectorWidget />
        <div className={classes(css.navBarDivider)} />
        {userInfo && (
          <div className={classes(css.userInfoContainer)}>
            <div className={classes(css.memberIcon)}>
              {userRole === RoleType.Admin && <StarSharpIcon />}
              {userRole === RoleType.Developer && <BuildSharpIcon />}
              {userRole === RoleType.Business && <BusinessIcon />}
            </div>
            {userInfo.email}
          </div>
        )}

        <Link className={classes(css.navBarLink)} to={paths.userInfo}>
          <PermIdentityIcon className={classes(css.icon)} />
        </Link>
        <Link className={classes(css.navBarLink)} to={paths.logoutPage}>
          <PowerSettingsNewIcon className={classes(css.icon)} />
        </Link>
      </div>
    </div>
  );
};
