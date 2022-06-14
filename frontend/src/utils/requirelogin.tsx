import { FC, ComponentType, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, useLocation, matchPath } from 'react-router-dom';
import { hasPermission } from '../../../shared/utils/permission';
import { Permission, RoleType } from '../../../shared/types/customTypes';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userActions } from '../redux/user';
import { userInfoSelector, userRoleSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';

export function requireLogin<T>(
  Component: ComponentType<T & { userInfo: UserInfo }>,
) {
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
    const joining = !!matchPath(pathname, {
      path: paths.joinRoadmap,
      exact: true,
      strict: true,
    });

    if (!loadedUserInfo) return null;
    if (userInfo) return <Component {...props} userInfo={userInfo} />;
    if (joining)
      return (
        <Redirect
          to={`${paths.registerPage}?redirectTo=${encodeURIComponent(
            pathname + search,
          )}`}
        />
      );
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

export function requireVerifiedEmail<T>(
  Component: ComponentType<T & { userInfo: UserInfo }>,
) {
  return requireLogin<T>((props) => {
    const { pathname, search } = useLocation();
    if (props.userInfo.emailVerified) return <Component {...props} />;
    return (
      <Redirect
        to={`${paths.emailVerification}?redirectTo=${encodeURIComponent(
          pathname + search,
        )}`}
      />
    );
  });
}

export const requireRoadmapRole = <T,>(
  Component: ComponentType<T>,
  required: RoleType[],
): FC<T> => (props) => {
  const role = useSelector(userRoleSelector, shallowEqual);
  if (!role || !required.includes(role))
    return <Redirect to={paths.notFound} />;
  return <Component {...props} />;
};

export const requireRoadmapPermission = <T,>(
  Component: ComponentType<T>,
  required: Permission,
): FC<T> => (props) => {
  const role = useSelector(userRoleSelector, shallowEqual);
  if (!hasPermission(role, required)) return <Redirect to={paths.notFound} />;
  return <Component {...props} />;
};
