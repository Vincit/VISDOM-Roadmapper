import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect, useLocation, matchPath } from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StoreDispatchType } from '../redux';
import { RootState } from '../redux/types';
import { userActions } from '../redux/user';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { paths } from '../routers/paths';

export const LogoutPage = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  const joining = !!matchPath(queryParams.get('redirectTo') || '', {
    path: paths.joinRoadmap,
  });

  useEffect(() => {
    if (userInfo) {
      dispatch(userActions.logout());
    }
  }, [dispatch, userInfo]);

  if (!userInfo && joining)
    return <Redirect to={`${paths.loginPage}${search}`} />;
  if (!userInfo) return <Redirect to={paths.home} />;
  return (
    <>
      <p>
        <Trans i18nKey="Logging out" />
      </p>
      <LoadingSpinner />
    </>
  );
};
