import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';
import { LayoutCol, LayoutRow } from '../components/CommonLayoutComponents';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SideBar } from '../components/SideBar';
import { DashboardPage } from '../pages/DashboardPage';
import { TaskListPage } from '../pages/TaskListPage';
import { UserListPage } from '../pages/UserListPage';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { roadmapsActions } from '../redux/roadmaps';
import {
  chosenRoadmapSelector,
  publicUsersSelector,
} from '../redux/roadmaps/selectors';
import { PublicUser, Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { requireLogin } from '../utils/requirelogin';
import { paths } from './paths';
import { PlannerPageRouter } from './PlannerPageRouter';

const RoadmapPageContainer = styled(LayoutCol)`
  padding: 16px 16px 0 16px;
`;

const routes = [
  {
    path: paths.roadmapRelative.dashboard,
    component: DashboardPage,
  },
  {
    path: paths.roadmapRelative.users,
    component: UserListPage,
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
  const publicUsers = useSelector<RootState, PublicUser[] | undefined>(
    publicUsersSelector,
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
    if (!publicUsers) {
      setIsLoadingUsers(true);
      dispatch(roadmapsActions.getPublicUsers()).then(() => {
        setIsLoadingUsers(false);
      });
    }
    setUseEffectFinished(true);
  }, [currentRoadmap, roadmapId, dispatch, publicUsers]);

  const renderOrRedirect = () => {
    if (!useEffectFinished) return;
    if (!isLoadingRoadmap && !currentRoadmap)
      return (
        <>
          <LayoutRow>
            <LayoutCol>Roadmap not found!</LayoutCol>
          </LayoutRow>
        </>
      );
    if (!isLoadingRoadmap && !isLoadingUsers) {
      return (
        <LayoutRow overflowY="auto" overflowX="auto">
          <SideBar />
          <RoadmapPageContainer overflowY="auto" overflowX="auto">
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
          </RoadmapPageContainer>
        </LayoutRow>
      );
    }
    return <LoadingSpinner />;
  };
  return <>{renderOrRedirect()}</>;
};

export const RoadmapRouter = requireLogin(RoadmapRouterComponent);
