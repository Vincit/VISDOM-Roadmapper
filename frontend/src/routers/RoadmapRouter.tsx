import { useEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
  matchPath,
} from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { ConfigurationPage } from '../pages/ConfigurationPage';
import { TeamListPage } from '../pages/TeamListPage';
import { ClientsListPage } from '../pages/ClientsListPage';
import { ClientOverviewPage } from '../pages/ClientOverviewPage';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import {
  chosenRoadmapIdSelector,
  fromMilestonesEditorSelector,
} from '../redux/roadmaps/selectors';
import { requireVerifiedEmail } from '../utils/requirelogin';
import { paths } from './paths';
import { PlannerPageRouter } from './PlannerPageRouter';
import { TasksPageRouter } from './TasksPageRouter';
import '../shared.scss';
import { usePrevious } from '../utils/usePrevious';
import { apiV2, selectById } from '../api/api';

const routes = [
  {
    path: paths.roadmapRelative.dashboard,
    component: DashboardPage,
  },
  {
    path: paths.roadmapRelative.team,
    component: TeamListPage,
  },
  {
    path: paths.roadmapRelative.tasks,
    component: TasksPageRouter,
  },
  {
    path: paths.roadmapRelative.clientOverview,
    component: ClientOverviewPage,
  },
  {
    path: paths.roadmapRelative.clients,
    component: ClientsListPage,
  },
  {
    path: paths.roadmapRelative.planner,
    component: PlannerPageRouter,
  },
  {
    path: paths.roadmapRelative.configure,
    component: ConfigurationPage,
  },
  {
    path: '',
    component: () => <Redirect to={paths.notFound} />,
    exact: false,
  },
];

const RoadmapRouterComponent = () => {
  const { path } = useRouteMatch();
  const history = useHistory();
  const { roadmapId: urlRoadmapId } = useParams<{
    roadmapId: string | undefined;
  }>();
  const selectedRoadmapId = useSelector(chosenRoadmapIdSelector);
  const previousRoadmapId = usePrevious<number | undefined | null>(
    selectedRoadmapId,
  );
  const fromMilestonesEditor = useSelector(
    fromMilestonesEditorSelector,
    shallowEqual,
  );
  const dispatch = useDispatch<StoreDispatchType>();
  const { data: roadmap, isFetching } = apiV2.useGetRoadmapsQuery(
    undefined,
    selectById(selectedRoadmapId),
  );

  useEffect(() => {
    // Try to select roadmap given in route parameters
    if (urlRoadmapId) {
      dispatch(roadmapsActions.selectCurrentRoadmap(+urlRoadmapId));
    }
  }, [dispatch, urlRoadmapId]);

  useEffect(() => {
    // If selectedRoadmapId changes, update the url to match that
    // (for cases where another browser tab switches roadmapId and the state gets synced into this tab)
    let newPath: string;
    const roadmapIdRegex = new RegExp('^/roadmap/\\d+/');
    if (!previousRoadmapId || selectedRoadmapId === previousRoadmapId) return;
    if (!selectedRoadmapId) {
      newPath = '/overview';
    } else if (history.location.pathname.match(roadmapIdRegex)) {
      newPath = history.location.pathname.replace(
        roadmapIdRegex,
        `/roadmap/${selectedRoadmapId}/`,
      );
    } else {
      newPath = `/roadmap/${selectedRoadmapId}${paths.roadmapRelative.dashboard}`;
    }
    history.push(`${newPath}${history.location.search}`);
  }, [
    selectedRoadmapId,
    previousRoadmapId,
    history.location.pathname,
    history,
    urlRoadmapId,
  ]);

  useEffect(() => {
    if (
      fromMilestonesEditor &&
      !matchPath(history.location.pathname, {
        path: `${paths.roadmapRouter}${paths.roadmapRelative.tasks}${paths.tasksRelative.taskOverview}`,
        exact: true,
      })
    )
      dispatch(roadmapsActions.clearFromMilestonesEditor());
  }, [dispatch, fromMilestonesEditor, history.location.pathname]);

  if (selectedRoadmapId && !isFetching && !roadmap)
    return <Redirect to={paths.notFound} />;

  return (
    <div className="layoutRow overflowYAuto">
      <div className="layoutCol roadmapPageContainer">
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
    </div>
  );
};

export const RoadmapRouter = requireVerifiedEmail(RoadmapRouterComponent);
