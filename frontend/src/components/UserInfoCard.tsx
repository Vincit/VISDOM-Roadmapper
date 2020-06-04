import React, { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { UserInfo } from '../redux/user/types';
import { StoreDispatchType } from '../redux/index';
import { getUserInfo } from '../redux/user/actions';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';

export const UserInfoCard = () => {
  const dispatch = useDispatch<StoreDispatchType>();
  const userInfo = useSelector<RootState, UserInfo>(
    userInfoSelector,
    shallowEqual,
  );

  useEffect(() => {
    dispatch(getUserInfo());
  }, [dispatch]);

  const { name, email, group, uuid } = userInfo;

  return (
    <div>
      <div>{name}</div>
      <div>{email}</div>
      <div>{group}</div>
      <div>{uuid}</div>
    </div>
  );
};
