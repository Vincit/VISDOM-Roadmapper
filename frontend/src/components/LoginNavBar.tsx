import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { paths } from '../routers/paths';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';

import css from './LoginNavBar.module.scss';

const classes = classNames.bind(css);

const navBars: {
  path: string;
  button: { to: (search: string) => string; label: string };
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
];

export const findLoginNavBar = (pathname: string) => {
  const bar = navBars.find(({ path }) =>
    matchPath(pathname, { path, strict: true, exact: true }),
  );
  if (!bar) return undefined;
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
      <Link className={classes(css.loginButton)} to={bar.button.to(search)}>
        <Trans i18nKey={bar.button.label} />
      </Link>
    </div>
  );
};

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
