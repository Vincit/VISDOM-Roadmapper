import React, { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
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

  useEffect(() => {
    if (userInfo) {
      dispatch(userActions.logout());
    }
  }, [dispatch, userInfo]);

  return (
    <>
      {!userInfo ? (
        <Redirect to={paths.home} />
      ) : (
        <>
          <p>
            <Trans i18nKey="Logging out" />
          </p>
          <LoadingSpinner />
        </>
      )}
    </>
  );
};
