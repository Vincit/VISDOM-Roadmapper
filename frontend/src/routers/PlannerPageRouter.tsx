import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { PlannerPageNavbar } from '../components/PlannerPageNavbar';
import { MilestonesEditor } from '../pages/MilestonesEditor';
import { paths } from './paths';
import { RoadmapRouter } from './RoadmapRouter';

const routes = [
  {
    path: paths.plannerRelative.editor,
    component: MilestonesEditor,
    exact: false,
  },
  {
    path: '',
    component: () => <Redirect to={paths.notFound} />,
    exact: false,
  },
];

export const PlannerPageRouter = () => {
  const { path } = useRouteMatch();
  console.log(path);

  return (
    <>
      <PlannerPageNavbar />
      <Switch>
        {routes.map((route) => (
          <Route
            key={path + route.path}
            path={path + route.path}
            component={route.component}
            exact={route.exact}
          />
        ))}
      </Switch>
    </>
  );
};
