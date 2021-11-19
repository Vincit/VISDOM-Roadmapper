import { FC } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { paths } from '../routers/paths';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';

import css from './LoginNavBar.module.scss';

const classes = classNames.bind(css);

const navBars: { path: string; component: FC<{ search: string }> }[] = [
  {
    path: paths.getStarted,
    component: () => (
      <div className={classes(css.loginNavBar)}>
        <VisdomLogo />
        <span />
        <Link className={classes(css.loginButton)} to={paths.logoutPage}>
          <Trans i18nKey="Logout" />
        </Link>
      </div>
    ),
  },
  {
    path: paths.loginPage,
    component: ({ search }) => (
      <div className={classes(css.loginNavBar)}>
        <Link to={paths.home} className={classes(css.visdomLogo)}>
          <VisdomLogo />
        </Link>
        <span />
        <Link
          className={classes(css.loginButton)}
          to={paths.registerPage + search}
        >
          <Trans i18nKey="Register" />
        </Link>
      </div>
    ),
  },
  {
    path: paths.registerPage,
    component: ({ search }) => (
      <div className={classes(css.loginNavBar)}>
        <Link to={paths.home} className={classes(css.visdomLogo)}>
          <VisdomLogo />
        </Link>
        <span />
        <Link
          className={classes(css.loginButton)}
          to={paths.loginPage + search}
        >
          <Trans i18nKey="Login" />
        </Link>
      </div>
    ),
  },
  {
    path: paths.emailVerification,
    component: () => (
      <div className={classes(css.loginNavBar)}>
        <Link to={paths.home} className={classes(css.visdomLogo)}>
          <VisdomLogo />
        </Link>
        <span />
        <Link className={classes(css.loginButton)} to={paths.logoutPage}>
          <Trans i18nKey="Logout" />
        </Link>
      </div>
    ),
  },
  {
    path: paths.verifyEmail,
    component: () => (
      <div className={classes(css.loginNavBar)}>
        <Link to={paths.home} className={classes(css.visdomLogo)}>
          <VisdomLogo />
        </Link>
        <span />
        <Link className={classes(css.loginButton)} to={paths.logoutPage}>
          <Trans i18nKey="Logout" />
        </Link>
      </div>
    ),
  },
];

export const findLoginNavBar = (pathname: string) =>
  navBars.find(({ path }) =>
    matchPath(pathname, { path, strict: true, exact: true }),
  )?.component;

export const LoginNavBar = () => {
  const { search, pathname } = useLocation();
  return findLoginNavBar(pathname)?.({ search }) ?? null;
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
