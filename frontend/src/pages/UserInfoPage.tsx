import { UserInfoCard } from '../components/UserInfoCard';
import { requireLogin } from '../utils/requirelogin';

export const UserInfoPage = requireLogin(({ userInfo }) => (
  <div>
    This is the user info page.
    <UserInfoCard userInfo={userInfo} />
  </div>
));
