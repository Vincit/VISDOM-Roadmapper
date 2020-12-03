import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { LayoutCol } from '../components/CommonLayoutComponents';
import { PlannerPageNavbar } from '../components/PlannerPageNavbar';
import { MilestonesEditor } from '../pages/MilestonesEditor';
import { RoadmapGraphPage } from '../pages/RoadmapGraphPage';
import { TimeEstimationPage } from '../pages/TimeEstimationPage';
import { paths } from './paths';

const routes = [
  {
    path: paths.plannerRelative.editor,
    component: MilestonesEditor,
    exact: false,
  },
  {
    path: paths.plannerRelative.graph,
    component: RoadmapGraphPage,
    exact: false,
  },
  {
    path: paths.plannerRelative.timeEstimation,
    component: TimeEstimationPage,
    exact: false,
  },
  {
    path: '',
    component: () => <Redirect to={paths.notFound} />,
    exact: false,
  },
];

const PlannerPagecontainer = styled(LayoutCol)`
  padding: 8px 0 0 0;
  margin: 0 0 0 0;
`;

export const PlannerPageRouter = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <PlannerPageNavbar />
      <PlannerPagecontainer overflowY="auto" overflowX="auto">
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
      </PlannerPagecontainer>
    </>
  );
};
