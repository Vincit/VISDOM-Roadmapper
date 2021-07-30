import { FC, ComponentType, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, useLocation } from 'react-router-dom';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';

export function requireLogin<T>(Component: ComponentType<T>) {
  const Inner: FC<T> = (props) => {
    const dispatch = useDispatch<StoreDispatchType>();
    const userInfo = useSelector<RootState, UserInfo | undefined>(
      userInfoSelector,
      shallowEqual,
    );
    const [loadedUserInfo, setLoadedUserInfo] = useState(false);
    useEffect(() => {
      if (userInfo === undefined && !loadedUserInfo) {
        dispatch(userActions.getUserInfo()).then(() => {
          setLoadedUserInfo(true);
        });
      } else {
        setLoadedUserInfo(true);
      }
    }, [userInfo, dispatch, loadedUserInfo]);
    const { pathname, search } = useLocation();

    if (!loadedUserInfo) return null;
    if (userInfo) return <Component {...props} />;
    return (
      <Redirect
        to={`${paths.loginPage}?redirectTo=${encodeURIComponent(
          pathname + search,
        )}`}
      />
    );
  };

  return Inner;
}
