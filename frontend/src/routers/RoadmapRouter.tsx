import { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ProjectOverviewPage } from '../pages/ProjectOverviewPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ConfigurationPage } from '../pages/ConfigurationPage';
import { TaskListPage } from '../pages/TaskListPage';
import { PeopleListPage } from '../pages/PeopleListPage';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../components/modals/types';
import { roadmapsActions } from '../redux/roadmaps';
import {
  chosenRoadmapSelector,
  roadmapUsersSelector,
  allCustomersSelector,
} from '../redux/roadmaps/selectors';
import { RoadmapUser, Customer, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { requireLogin } from '../utils/requirelogin';
import { paths } from './paths';
import { PlannerPageRouter } from './PlannerPageRouter';
import '../shared.scss';

const routes = [
  {
    path: paths.roadmapRelative.overview,
    component: ProjectOverviewPage,
  },
  {
    path: paths.roadmapRelative.dashboard,
    component: DashboardPage,
  },
  {
    path: paths.roadmapRelative.people,
    component: PeopleListPage,
  },
  {
    path: paths.roadmapRelative.taskList,
    component: TaskListPage,
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
  const query = new URLSearchParams(useLocation().search);
  const { path } = useRouteMatch();
  const { roadmapId } = useParams<{ roadmapId: string | undefined }>();
  const dispatch = useDispatch<StoreDispatchType>();
  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );
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

  // Parse query params
  let queryModal = query.get('openModal');
  if (
    !queryModal ||
    !Object.values(ModalTypes).includes(queryModal as ModalTypes)
  ) {
    queryModal = null;
  }
  let queryProps = query.get('modalProps');
  try {
    queryProps = JSON.parse(queryProps!);
  } catch (e) {
    queryProps = null;
  }

  useEffect(() => {
    // Open modals for corresponding query params
    if (!queryModal) return;
    if (!queryProps) return;
    if (!currentRoadmap) return;

    dispatch(
      modalsActions.showModal({
        modalType: queryModal as ModalTypes,
        modalProps: queryProps as any,
      }),
    );
  }, [queryModal, queryProps, currentRoadmap, dispatch]);

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
    if (!roadmapUsers && currentRoadmap) {
      setIsLoadingUsers(true);
      dispatch(roadmapsActions.getRoadmapUsers(currentRoadmap.id)).then(() => {
        setIsLoadingUsers(false);
      });
    }
    if (!customers && currentRoadmap) {
      setIsLoadingCustomers(true);
      dispatch(roadmapsActions.getCustomers(currentRoadmap.id)).then(() => {
        setIsLoadingCustomers(false);
      });
    }
    setUseEffectFinished(true);
  }, [currentRoadmap, roadmapId, dispatch, roadmapUsers, customers]);

  const renderOrRedirect = () => {
    if (!useEffectFinished) return;
    if (!isLoadingRoadmap && !currentRoadmap)
      return (
        <>
          <div className="layoutRow">
            <div className="layoutCol">Roadmap not found!</div>
          </div>
        </>
      );
    if (!isLoadingRoadmap && !isLoadingUsers && !isLoadingCustomers) {
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
    }
    return <LoadingSpinner />;
  };
  return <>{renderOrRedirect()}</>;
};

export const RoadmapRouter = requireLogin(RoadmapRouterComponent);
