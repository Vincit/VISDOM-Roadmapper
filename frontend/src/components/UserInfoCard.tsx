import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';

export const UserInfoCard = () => {
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  return (
    <div>
      {userInfo ? (
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
