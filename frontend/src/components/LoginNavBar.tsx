import { FC } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '../routers/paths';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';

import css from './LoginNavBar.module.scss';

const classes = classNames.bind(css);

export const LoginNavBar: FC<{
  type: 'landing' | 'login' | 'register' | 'getStarted';
}> = ({ type }) => (
  <div
    className={classes(css.loginNavBar, {
      [css.landingNavBar]: type === 'landing',
    })}
  >
    {type === 'landing' || type === 'getStarted' ? (
      <VisdomLogo />
    ) : (
      <Link to={paths.home} className={classes(css.visdomLogo)}>
        <VisdomLogo />
      </Link>
    )}
    <span />
    {type === 'getStarted' && (
      <Link className={classes(css.loginButton)} to={paths.logoutPage}>
        <Trans i18nKey="Logout" />
      </Link>
    )}
    {type === 'login' && (
      <Link className={classes(css.loginButton)} to={paths.registerPage}>
        <Trans i18nKey="Register" />
      </Link>
    )}
    {(type === 'register' || type === 'landing') && (
      <Link className={classes(css.loginButton)} to={paths.loginPage}>
        <Trans i18nKey="Login" />
      </Link>
    )}
  </div>
);
