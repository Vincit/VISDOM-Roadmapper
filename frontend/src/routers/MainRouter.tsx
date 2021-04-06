import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { NavLayout } from '../components/NavLayout';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { UserInfoPage } from '../pages/UserInfoPage';
import { paths } from './paths';
import { RoadmapRouter } from './RoadmapRouter';

const routes = [
  {
    path: paths.loginPage,
    component: () => <NavLayout Content={LoginPage} />,
    exact: false,
  },
  {
    path: paths.logoutPage,
    component: () => <NavLayout Content={LogoutPage} />,
    exact: false,
  },
  {
    path: paths.userInfo,
    component: () => <NavLayout Content={UserInfoPage} />,
    exact: false,
  },
  {
    path: paths.roadmapRouter,
    component: () => <NavLayout Content={RoadmapRouter} />,
    exact: false,
  },
  {
    path: paths.home,
    component: () => <NavLayout Content={HomePage} />,
    exact: true,
  },
  {
    path: paths.notFound,
    component: () => <NavLayout Content={NotFoundPage} />,
    exact: true,
  },
  {
    path: '',
    component: () => <Redirect to={paths.notFound} />,
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
      </Switch>
    </>
  );
};
