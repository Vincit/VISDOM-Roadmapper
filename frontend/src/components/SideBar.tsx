import React from 'react';
import { Col, Nav } from 'react-bootstrap';
import { Trans } from 'react-i18next';
import { Link, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components';
import { paths } from '../routers/paths';

const Sidebar = styled(Col)`
  display: block;
  min-width: 130px !important;
  max-width: 130px !important;
  min-height: 100%;
  border-right: solid 1px #000;
`;

export const SideBar = () => {
  const { url } = useRouteMatch();

  return (
    <>
      <Sidebar>
        <Nav>
          <Nav.Link as={Link} to={url + paths.roadmapRelative.taskList}>
            <Trans i18nKey="Task list" />
          </Nav.Link>
          <Nav.Link as={Link} to={url + paths.roadmapRelative.planner}>
            <Trans i18nKey="Planner" />
          </Nav.Link>
        </Nav>
      </Sidebar>
    </>
  );
};
