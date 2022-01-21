import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { RootState } from '../redux/types';
import { UserInfo } from '../redux/user/types';
import { userInfoSelector } from '../redux/user/selectors';
import { paths } from '../routers/paths';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';

import css from './LoginNavBar.module.scss';

const classes = classNames.bind(css);

const navBars: {
  path: string;
  button?: { to: (search: string) => string; label: string };
  linkHome?: boolean;
}[] = [
  {
    path: paths.getStarted,
    button: { to: () => paths.logoutPage, label: 'Logout' },
  },
  {
    path: paths.loginPage,
    button: { to: (search) => paths.registerPage + search, label: 'Register' },
    linkHome: true,
  },
  {
    path: paths.registerPage,
    button: { to: (search) => paths.loginPage + search, label: 'Login' },
    linkHome: true,
  },
  {
    path: paths.emailVerification,
    button: { to: () => paths.logoutPage, label: 'Logout' },
    linkHome: true,
  },
  {
    path: paths.verifyEmail,
    button: { to: () => paths.logoutPage, label: 'Logout' },
    linkHome: true,
  },
  {
    path: paths.notFound,
    linkHome: true,
  },
  {
    path: paths.forgotPassword,
    button: { to: (search) => paths.home + search, label: 'Home' },
    linkHome: true,
  },
  {
    path: paths.resetPassword,
    button: { to: (search) => paths.home + search, label: 'Home' },
    linkHome: true,
  },
];

export const findLoginNavBar = (pathname: string, loggedIn: boolean) => {
  const bar = navBars.find(({ path }) =>
    matchPath(pathname, { path, strict: true, exact: true }),
  );
  if (!bar) return undefined;

  const { to, label } = loggedIn
    ? { to: paths.logoutPage, label: 'Logout' }
    : { to: paths.loginPage, label: 'Login' };

  return ({ search }: { search: string }) => (
    <div className={classes(css.loginNavBar)}>
      {bar.linkHome ? (
        <Link to={paths.home} className={classes(css.visdomLogo)}>
          <VisdomLogo />
        </Link>
      ) : (
        <VisdomLogo />
      )}
      <span />
      <Link
        className={classes(css.loginButton)}
        to={bar.button?.to(search) || to}
      >
        <Trans i18nKey={bar.button?.label || label} />
      </Link>
    </div>
  );
};

export const LoginNavBar = () => {
  const { search, pathname } = useLocation();
  const loggedIn = !!useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  return findLoginNavBar(pathname, loggedIn)?.({ search }) ?? null;
};

export const LandingPageNavBar = () => {
  const { search } = useLocation();
  return (
    <div className={classes(css.loginNavBar, css.landingNavBar)}>
      <VisdomLogo />
      <span />
      <Link className={classes(css.loginButton)} to={paths.loginPage + search}>
        <Trans i18nKey="Login" />
      </Link>
    </div>
  );
};
