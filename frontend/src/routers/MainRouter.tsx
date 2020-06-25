import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { RoadmapHomePage } from '../pages/RoadmapHomepage';
import { UserInfoPage } from '../pages/UserInfoPage';
import { paths } from './paths';
import { RoadmapRouter } from './RoadmapRouter';

const routes = [
  {
    path: paths.home,
    component: HomePage,
    exact: true,
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
    path: paths.roadmapHome,
    component: RoadmapHomePage,
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
