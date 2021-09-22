import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DashboardPage } from '../pages/DashboardPage';
import { ConfigurationPage } from '../pages/ConfigurationPage';
import { PeopleListPage } from '../pages/PeopleListPage';
import { TaskOverviewPage } from '../pages/TaskOverviewPage';
import { ClientsListPage } from '../pages/ClientsListPage';
import { ClientOverviewPage } from '../pages/ClientOverviewPage';
import { StoreDispatchType } from '../redux';
import { roadmapsActions } from '../redux/roadmaps';
import { UserInfo } from '../redux/user/types';
import { getType, hasPermission } from '../utils/UserUtils';
import { Permission } from '../../../shared/types/customTypes';
import {
  chosenRoadmapSelector,
  roadmapUsersSelector,
  allCustomersSelector,
} from '../redux/roadmaps/selectors';
import { RoadmapUser, Customer, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { requireVerifiedEmail } from '../utils/requirelogin';
import { paths } from './paths';
import { PlannerPageRouter } from './PlannerPageRouter';
import { TasksPageRouter } from './TasksPageRouter';
import '../shared.scss';

const routes = [
  {
    path: paths.roadmapRelative.dashboard,
    component: DashboardPage,
  },
  {
    path: paths.roadmapRelative.people,
    component: PeopleListPage,
  },
  {
    path: paths.roadmapRelative.taskOverview,
    component: TaskOverviewPage,
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

const RoadmapRouterComponent = ({ userInfo }: { userInfo: UserInfo }) => {
  const { path } = useRouteMatch();
  const { roadmapId } = useParams<{ roadmapId: string | undefined }>();
  const dispatch = useDispatch<StoreDispatchType>();
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
  const type = getType(userInfo.roles, currentRoadmap?.id);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [useEffectFinished, setUseEffectFinished] = useState(false);
  const roadmapUsers = useSelector<RootState, RoadmapUser[] | undefined>(
    roadmapUsersSelector(),
    shallowEqual,
  );
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const customers = useSelector<RootState, Customer[] | undefined>(
    allCustomersSelector(),
    shallowEqual,
  );

  useEffect(() => {
    // Try to select roadmap given in route parameters
    if (roadmapId) {
      dispatch(roadmapsActions.selectCurrentRoadmap(+roadmapId));
    }
    if (!currentRoadmap) {
      setIsLoadingRoadmap(true);
      dispatch(roadmapsActions.getRoadmaps()).then(() => {
        setIsLoadingRoadmap(false);
      });
    }
    if (
      !roadmapUsers &&
      currentRoadmap &&
      hasPermission(type, Permission.RoadmapReadUsers)
    ) {
      setIsLoadingUsers(true);
      dispatch(roadmapsActions.getRoadmapUsers(currentRoadmap.id)).then(() => {
        setIsLoadingUsers(false);
      });
    }
    if (
      !customers &&
      currentRoadmap &&
      hasPermission(type, Permission.RoadmapReadUsers)
    ) {
      setIsLoadingCustomers(true);
      dispatch(roadmapsActions.getCustomers(currentRoadmap.id)).then(() => {
        setIsLoadingCustomers(false);
      });
    }
    setUseEffectFinished(true);
  }, [currentRoadmap, roadmapId, dispatch, roadmapUsers, customers, type]);

  if (!useEffectFinished) return null;
  if (!isLoadingRoadmap && !currentRoadmap)
    return (
      <div className="layoutRow">
        <div className="layoutCol">Roadmap not found!</div>
      </div>
    );
  if (isLoadingRoadmap || isLoadingUsers || isLoadingCustomers)
    return <LoadingSpinner />;

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
