import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector, shallowEqual } from 'react-redux';
import { userRoleSelector } from '../redux/user/selectors';
import { PageNavBar } from '../components/PageNavBar';
import { MilestonesEditor } from '../pages/MilestonesEditor';
import { PlannerWeightsPage } from '../pages/PlannerWeightsPage';
import { RoadmapGraphPage } from '../pages/RoadmapGraphPage';
import { TimeEstimationPage } from '../pages/TimeEstimationPage';
import { requireRoadmapPermission } from '../utils/requirelogin';
import { Permission } from '../../../shared/types/customTypes';
import { hasPermission } from '../../../shared/utils/permission';
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
    component: requireRoadmapPermission(
      PlannerWeightsPage,
      Permission.RoadmapReadCustomerValues,
    ),
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
  const { t } = useTranslation();
  const role = useSelector(userRoleSelector, shallowEqual);
  const hasReadCustomerValuesPermission = hasPermission(
    role,
    Permission.RoadmapReadCustomerValues,
  );

  const headers = [
    {
      url: '/editor',
      text: t('Milestones'),
    },
    {
      url: '/graph',
      text: t('Roadmap'),
    },
    ...(hasReadCustomerValuesPermission
      ? [
          {
            url: '/weights',
            text: t('Client Weights'),
          },
        ]
      : []),
    {
      url: '/timeestimation',
      text: t('Time Estimation'),
    },
  ];

  return (
    <>
      <PageNavBar headers={headers} />
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
