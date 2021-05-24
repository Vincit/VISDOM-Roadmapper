import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '../routers/paths';
import { ReactComponent as VisdomLogo } from '../icons/visdom_icon.svg';

import css from './LoginNavBar.module.scss';

const classes = classNames.bind(css);

export const LoginNavBar: React.FC<{
  type: 'landing' | 'login' | 'register';
}> = ({ type }) => {
  const [hidden, setHidden] = useState(false);
  const [hiddenPos, setHiddenPos] = useState(0);
  const [previousScroll, setPreviousScroll] = useState(0);

  const handleScroll = () => {
    const scroll = Math.round(window.pageYOffset);
    if (scroll < previousScroll) {
      setHidden(false);
      setHiddenPos(scroll);
    }
    if (scroll - hiddenPos >= 80) {
      setHidden(true);
      setHiddenPos(scroll);
    }
    setPreviousScroll(scroll);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      className={classes(css.loginNavBar, {
        [css.landingNavBar]: type === 'landing',
        [css.hidden]: hidden,
      })}
    >
      <Link to={paths.home} className={classes(css.visdomLogo)}>
        <VisdomLogo onClick={scrollToTop} />
      </Link>
      <span />
      {type === 'login' ? (
        <Link className={classes(css.loginButton)} to={paths.registerPage}>
          <Trans i18nKey="Register" />
        </Link>
      ) : (
        <Link className={classes(css.loginButton)} to={paths.loginPage}>
          <Trans i18nKey="Login" />
        </Link>
      )}
    </div>
  );
};
