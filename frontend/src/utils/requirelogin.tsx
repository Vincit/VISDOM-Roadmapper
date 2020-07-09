import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, useRouteMatch } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';

export function requireLogin<T>(Component: React.ComponentType<T>) {
  const Inner: React.FC<T> = (props) => {
    const dispatch = useDispatch<StoreDispatchType>();
    const userInfo = useSelector<RootState, UserInfo | undefined>(
      userInfoSelector,
      shallowEqual,
    );
    const [haveUserInfo, setHaveUserInfo] = useState(false);
    useEffect(() => {
      if (userInfo === undefined) {
        dispatch(userActions.getUserInfo());
      } else {
        setHaveUserInfo(true);
      }
    }, [userInfo, dispatch]);
    const { url } = useRouteMatch();

    if (!haveUserInfo) return null;
    if (userInfo) return <Component {...props} />;
    return <Redirect to={`${paths.loginPage}?redirectTo=${url}`} />;
  };

  return Inner;
}
