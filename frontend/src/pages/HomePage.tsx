import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo } from '../redux/user/types';
import { LandingPage } from './LandingPage';

export const HomePage = () => {
  const loggedInUser = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );
  return loggedInUser ? <div>This is the home page.</div> : <LandingPage />;
};
