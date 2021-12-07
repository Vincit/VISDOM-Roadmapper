import classNames from 'classnames';
import { UserInfoCard } from '../components/UserInfoCard';
import { requireLogin } from '../utils/requirelogin';
import css from './UserInfoPage.module.scss';

const classes = classNames.bind(css);

export const UserInfoPage = requireLogin(({ userInfo }) => {
  return (
    <div className={classes(css.container)}>
      <UserInfoCard userInfo={userInfo} />
    </div>
  );
});
