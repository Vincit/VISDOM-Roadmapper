import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Trans } from 'react-i18next';
import { UserInfo, UserType } from '../redux/user/types';
import { StoreDispatchType } from '../redux/index';
import { modalsActions } from '../redux/modals';
import { userInfoSelector, loggedInSelector } from '../redux/user/selectors';
import { ModalTypes } from '../redux/modals/types';
import { RootState } from '../redux/types';

export const UserInfoCard = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  const loggedIn = useSelector<RootState, boolean>(
    loggedInSelector,
    shallowEqual,
  );

  useEffect(() => {
    if (!loggedIn) {
      dispatch(
        modalsActions.showModal({
          modalType: ModalTypes.LOGIN_MODAL,
          modalProps: {
            username: 'BusinessPerson1',
            password: 'test',
          },
        }),
      );
    }
  }, [dispatch, loggedIn]);

  return (
    <div>
      {userInfo && loggedIn ? (
        <>
          <div>{userInfo.username}</div>
          <div>{userInfo.email}</div>
          <div>{UserType[userInfo.type]}</div>
          <div>{userInfo.id}</div>
        </>
      ) : (
        <div>
          <Trans i18nKey="Not logged in" />
        </div>
      )}
    </div>
  );
};
