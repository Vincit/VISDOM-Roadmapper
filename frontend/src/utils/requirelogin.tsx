import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router-dom';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';

export function requireLogin<T>(Component: React.ComponentType<T>) {
  const Inner: React.FC<T> = (props) => {
    const userInfo = useSelector<RootState, UserInfo | undefined>(
      userInfoSelector,
      shallowEqual,
    );
    const { url } = useRouteMatch();

    if (userInfo) return <Component {...props} />;
    return <Redirect to={`${paths.loginPage}?redirectTo=${url}`} />;
  };

  return Inner;
}
