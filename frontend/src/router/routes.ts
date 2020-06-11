import { paths } from './paths';
import { HomePage } from '../pages/HomePage';
import { UserInfoPage } from '../pages/UserInfoPage';
import { TaskListPage } from '../pages/TaskList';
import { RatingPage } from '../pages/Ratings';

export const routes = [
  {
    path: paths.home,
    component: HomePage,
  },
  {
    path: paths.userInfo,
    component: UserInfoPage,
  },
  {
    path: paths.taskList,
    component: TaskListPage,
  },
  { path: paths.ratings, component: RatingPage },
];
