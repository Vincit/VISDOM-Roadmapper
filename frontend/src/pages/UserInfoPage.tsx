import React from 'react';
import { UserInfoCard } from '../components/UserInfoCard';
import { requireLogin } from '../utils/requirelogin';

const UserInfoPageComponent = () => {
  return (
    <div>
      This is the user info page.
      <UserInfoCard />
    </div>
  );
};

export const UserInfoPage = requireLogin(UserInfoPageComponent);
