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
import { PlannerPage } from '../pages/PlannerPage';
import { TaskListPage } from '../pages/TaskListPage';
import { UserListPage } from '../pages/UserListPage';
import { StoreDispatchType } from '../redux';
import { modalsActions } from '../redux/modals';
import { ModalTypes } from '../redux/modals/types';
import { roadmapsActions } from '../redux/roadmaps';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { requireLogin } from '../utils/requirelogin';
import { paths } from './paths';

const RoadmapPageContainer = styled(LayoutCol)`
  padding: 16px;
`;

const routes = [
  {
    path: paths.roadmapRelative.dashboard,
    component: () => <p>Dashboard page not implemented</p>,
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
    component: PlannerPage,
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
  const [isLoading, setIsLoading] = useState(false);
  const [useEffectFinished, setUseEffectFinished] = useState(false);

  // Parse query params
  const queryModal = query.get('openModal');
  let queryTask: number | undefined;
  queryTask = parseInt(query.get('modalTask')!, 10);
  if (!Number.isInteger(queryTask)) queryTask = undefined;

  useEffect(() => {
    // Open modals for corresponding query params
    if (!queryModal) return;
    if (!queryTask) return;
    if (!currentRoadmap) return;

    const modalTask = currentRoadmap.tasks.find(
      (task) => task.id === queryTask,
    );
    if (!modalTask) return;

    switch (queryModal) {
      case ModalTypes.TASK_INFO_MODAL:
        dispatch(
          modalsActions.showModal({
            modalType: ModalTypes.TASK_INFO_MODAL,
            modalProps: {
              task: modalTask,
            },
          }),
        );
        break;
      case ModalTypes.TASK_RATINGS_INFO_MODAL:
        dispatch(
          modalsActions.showModal({
            modalType: ModalTypes.TASK_RATINGS_INFO_MODAL,
            modalProps: {
              task: modalTask,
            },
          }),
        );
        break;
      case ModalTypes.EDIT_TASK_MODAL:
        dispatch(
          modalsActions.showModal({
            modalType: ModalTypes.EDIT_TASK_MODAL,
            modalProps: {
              task: modalTask,
            },
          }),
        );
        break;
      case ModalTypes.RATE_TASK_MODAL:
        dispatch(
          modalsActions.showModal({
            modalType: ModalTypes.RATE_TASK_MODAL,
            modalProps: {
              task: modalTask,
            },
          }),
        );
        break;
      default:
        break;
    }
  }, [queryModal, queryTask, currentRoadmap, dispatch]);

  useEffect(() => {
    // Try to select roadmap given in route parameters
    if (roadmapId) {
      dispatch(roadmapsActions.selectCurrentRoadmap(+roadmapId));
    }
    if (!currentRoadmap) {
      setIsLoading(true);
      dispatch(roadmapsActions.getRoadmaps()).then(() => {
        setIsLoading(false);
      });
    }
    setUseEffectFinished(true);
  }, [currentRoadmap, roadmapId, dispatch]);

  const renderOrRedirect = () => {
    if (!useEffectFinished) return;
    if (!isLoading && !currentRoadmap)
      return (
        <>
          <LayoutRow>
            <LayoutCol>Roadmap not found!</LayoutCol>
          </LayoutRow>
        </>
      );
    if (!isLoading) {
      return (
        <LayoutRow overflowY="auto">
          <SideBar />
          <RoadmapPageContainer>
            <Switch>
              {routes.map((route) => (
                <Route
                  key={path + route.path}
                  path={path + route.path}
                  component={route.component}
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
