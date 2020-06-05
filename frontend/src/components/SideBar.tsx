import React from 'react';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import { Nav, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { paths } from '../router/paths';

const Sidebar = styled(Col)`
  display: block;
  min-width: 130px !important;
  max-width: 130px !important;
  min-height: 100%;
  border-right: solid 1px #000;
`;

export const SideBar = () => {
  return (
    <>
      <Sidebar>
        <Nav>
          <Nav.Link as={Link} to={paths.taskList}>
            <Trans i18nKey="Task list" />
          </Nav.Link>
        </Nav>
      </Sidebar>
    </>
  );
};
