import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { PlannerPageNavbar } from '../components/PlannerPageNavbar';
import { MilestonesEditor } from '../pages/MilestonesEditor';
import { PlannerWeightsPage } from '../pages/PlannerWeightsPage';
import { RoadmapGraphPage } from '../pages/RoadmapGraphPage';
import { TimeEstimationPage } from '../pages/TimeEstimationPage';
import { paths } from './paths';
import '../shared.scss';

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
    path: paths.plannerRelative.weights,
    component: PlannerWeightsPage,
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

  return (
    <>
      <PlannerPageNavbar />
      <div className="layoutCol">
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
      </div>
    </>
  );
};
