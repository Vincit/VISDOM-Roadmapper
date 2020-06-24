import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import { paths } from './paths';
import { RoadmapHomePage } from '../pages/RoadmapHomepage';
import { UserInfoPage } from '../pages/UserInfoPage';
import { RoadmapRouter } from './RoadmapRouter';
import { HomePage } from '../pages/HomePage';

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
      <Col>
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
      </Col>
    </>
  );
};
