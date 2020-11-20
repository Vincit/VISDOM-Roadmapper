import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import { paths } from '../routers/paths';

const Navbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 8px;
`;

const NavbarButton = styled(Link)<{ highlight: number }>`
  font-size: 18px;
  padding: 8px;
  padding-left: 32px;
  padding-right: 32px;
  border-bottom: ${(props) =>
    props.highlight ? '3px solid green' : '1px solid black'};
  justify-content: center;
  color: black;
  text-align: center;
  text-decoration: ${(props) => (props.highlight ? 'underline' : 'none')};
  user-select: none;
  background-color: ${(props) => (props.highlight ? '#e3e3e3' : 'inherit')};
  :hover {
    background-color: ${(props) => (props.highlight ? '#e3e3e3' : '#ededed')};
    text-decoration: underline;
    color: black;
  }
`;

export const PlannerPageNavbar = () => {
  const { url } = useRouteMatch();
  const { pathname } = useLocation();
  return (
    <Navbar>
      <NavbarButton
        to={url + paths.plannerRelative.editor}
        highlight={
          pathname.startsWith(url + paths.plannerRelative.editor) ? 1 : 0
        }
      >
        Milestones
      </NavbarButton>
    </Navbar>
  );
};
