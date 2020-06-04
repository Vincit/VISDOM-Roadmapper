import { paths } from './paths';
import { HomePage } from '../pages/HomePage';
import { UserInfoPage } from '../pages/UserInfoPage';

export const routes = [
  {
    path: paths.home,
    component: HomePage,
  },
  {
    path: paths.userInfo,
    component: UserInfoPage,
  },
];
