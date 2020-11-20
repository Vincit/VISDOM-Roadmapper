import React from 'react';
import { Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as DashboardIcon } from '../icons/dashboard_icon.svg';
import { ReactComponent as PlanButtonIcon } from '../icons/sidebar_plan.svg';
import { ReactComponent as TasksButtonIcon } from '../icons/sidebar_tasks.svg';
import { ReactComponent as UsersIcon } from '../icons/users_icon.svg';
import { RootState } from '../redux/types';
import { userInfoSelector } from '../redux/user/selectors';
import { UserInfo, UserType } from '../redux/user/types';
import { paths } from '../routers/paths';

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: start;
  vertical-align: center;
  min-width: 96px !important;
  max-width: 96px !important;
  min-height: 100%;
  background-color: #f3f3f3;
  overflow: hidden;
`;

const SideBarButton = styled(Link)<{ highlight: number }>`
  display: flex;
  flex-direction: column;
  max-height: 96px;
  min-height: 96px;
  max-width: 96px;
  min-width: 96px;
  justify-content: center;
  color: black;
  text-align: center;
  text-decoration: none;
  user-select: none;
  background-color: ${(props) => (props.highlight ? '#e3e3e3' : 'inherit')};
  :hover {
    background-color: ${(props) => (props.highlight ? '#e3e3e3' : '#ededed')};
    text-decoration: none;
    color: black;
  }
`;

const SideBarIcon = styled.div``;

export const SideBar = () => {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  const userInfo = useSelector<RootState, UserInfo | undefined>(
    userInfoSelector,
    shallowEqual,
  );

  return (
    <>
      <Sidebar>
        <SideBarButton
          to={url + paths.roadmapRelative.dashboard}
          highlight={
            pathname.startsWith(url + paths.roadmapRelative.dashboard) ? 1 : 0
          }
        >
          <SideBarIcon>
            <DashboardIcon />
          </SideBarIcon>
          <Trans i18nKey="Dashboard" />
        </SideBarButton>
        <SideBarButton
          to={url + paths.roadmapRelative.taskList}
          highlight={
            pathname.startsWith(url + paths.roadmapRelative.taskList) ? 1 : 0
          }
        >
          <SideBarIcon>
            <TasksButtonIcon />
          </SideBarIcon>
          <Trans i18nKey="Tasks" />
        </SideBarButton>
        {userInfo!.type === UserType.AdminUser && (
          <>
            <SideBarButton
              to={url + paths.roadmapRelative.users}
              highlight={
                pathname.startsWith(url + paths.roadmapRelative.users) ? 1 : 0
              }
            >
              <SideBarIcon>
                <UsersIcon />
              </SideBarIcon>
              <Trans i18nKey="Stakeholders" />
            </SideBarButton>
            <SideBarButton
              to={
                url +
                paths.roadmapRelative.planner +
                paths.plannerRelative.editor
              }
              highlight={
                pathname.startsWith(
                  url +
                    paths.roadmapRelative.planner +
                    paths.plannerRelative.editor,
                )
                  ? 1
                  : 0
              }
            >
              <SideBarIcon>
                <PlanButtonIcon />
              </SideBarIcon>
              <Trans i18nKey="Plan" />
            </SideBarButton>
          </>
        )}
      </Sidebar>
    </>
  );
};
