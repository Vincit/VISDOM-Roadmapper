import React from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';

import css from './LoginNavBar.module.scss';

const classes = classNames.bind(css);

export const LoginNavBar = () => (
  <div className={classes(css.loginNavBar)}>
    <VisdomLogo />
    <span />
    <Link className={classes(css.loginButton)} to="/login">
      <Trans i18nKey="Login" />
    </Link>
  </div>
);
