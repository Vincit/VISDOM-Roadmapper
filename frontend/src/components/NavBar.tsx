import { useSelector, shallowEqual } from 'react-redux';
import { Trans } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import classNames from 'classnames';
import { ReactComponent as CornerPiece } from '../icons/corner_rounder.svg';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';
import { paths } from '../routers/paths';
import { RoadmapSelectorWidget } from './RoadmapSelectorWidget';
import css from './NavBar.module.scss';
import { findLoginNavBar } from './LoginNavBar';
import { userInfoSelector, userRoleSelector } from '../redux/user/selectors';
import { chosenRoadmapIdSelector } from '../redux/roadmaps/selectors';
import { RoleIcon } from './RoleIcons';
import colors from '../colors.module.scss';

const classes = classNames.bind(css);

export const NavBar = () => {
  const { search, pathname } = useLocation();
  const roadmapId = useSelector(chosenRoadmapIdSelector);
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
      {pathname.startsWith(paths.userInfo) && !roadmapId && (
        <Link to={paths.overview} className={classes(css.logo)}>
          <VisdomLogo />
        </Link>
      )}
      <div className={classes(css.navBarRightSide)}>
        <div className={classes(css.navBarText)}>
          <Trans i18nKey="Project" />
        </div>
        <RoadmapSelectorWidget />
        <div className={classes(css.navBarDivider)} />
        {userInfo && (
          <div className={classes(css.userInfoContainer)}>
            {userRole && (
              <RoleIcon type={userRole} color={colors.black100} small tooltip />
            )}
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
