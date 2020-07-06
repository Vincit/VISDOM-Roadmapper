import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { UserInfoPage } from '../pages/UserInfoPage';
import { paths } from './paths';
import { RoadmapRouter } from './RoadmapRouter';

const routes = [
  {
    path: paths.loginPage,
    component: LoginPage,
    exact: false,
  },
  {
    path: paths.logoutPage,
    component: LogoutPage,
    exact: false,
  },
  {
    path: paths.userInfo,
    component: UserInfoPage,
    exact: false,
  },
  {
    path: paths.roadmapRouter,
    component: RoadmapRouter,
    exact: false,
  },
  {
    path: paths.home,
    component: HomePage,
    exact: false,
  },
];

export const MainRouter = () => {
  return (
    <>
      <Switch>
        {routes.map((route) => (
          <Route
            exact={route.exact}
            key={route.path}
            path={route.path}
            component={route.component}
          />
        ))}
        <RoadmapRouter />
      </Switch>
    </>
  );
};
