import React from 'react';
import { Trans } from 'react-i18next';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { ReactComponent as DashboardIcon } from '../icons/dashboard_icon.svg';
import { ReactComponent as PlanButtonIcon } from '../icons/sidebar_plan.svg';
import { ReactComponent as TasksButtonIcon } from '../icons/sidebar_tasks.svg';
import { ReactComponent as UsersIcon } from '../icons/users_icon.svg';
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
  border-right: solid 1px #000;
  background-color: #f3f3f3;
  overflow: hidden;
`;

const SideBarButton = styled(Link)<{ isActive?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 96px;
  width: 96px;
  justify-content: center;
  color: black;
  text-align: center;
  text-decoration: none;
  user-select: none;
  background-color: ${(props) => (props.isActive ? '#e3e3e3' : 'inherit')};
  :hover {
    background-color: ${(props) => (props.isActive ? '#e3e3e3' : '#ededed')};
    text-decoration: none;
    color: black;
  }
`;

const SideBarIcon = styled.div``;

export const SideBar = () => {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();

  return (
    <>
      <Sidebar>
        <SideBarButton
          to={url + paths.roadmapRelative.dashboard}
          isActive={pathname.startsWith(url + paths.roadmapRelative.dashboard)}
        >
          <SideBarIcon>
            <DashboardIcon />
          </SideBarIcon>
          <Trans i18nKey="Dashboard" />
        </SideBarButton>
        <SideBarButton
          to={url + paths.roadmapRelative.taskList}
          isActive={pathname.startsWith(url + paths.roadmapRelative.taskList)}
        >
          <SideBarIcon>
            <TasksButtonIcon />
          </SideBarIcon>
          <Trans i18nKey="Tasks" />
        </SideBarButton>
        <SideBarButton
          to={url + paths.roadmapRelative.users}
          isActive={pathname.startsWith(url + paths.roadmapRelative.users)}
        >
          <SideBarIcon>
            <UsersIcon />
          </SideBarIcon>
          <Trans i18nKey="Users" />
        </SideBarButton>
        <SideBarButton
          to={url + paths.roadmapRelative.planner}
          isActive={pathname.startsWith(url + paths.roadmapRelative.planner)}
        >
          <SideBarIcon>
            <PlanButtonIcon />
          </SideBarIcon>
          <Trans i18nKey="Plan" />
        </SideBarButton>
      </Sidebar>
    </>
  );
};
