import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { shallowEqual, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { paths } from '../routers/paths';
import { Roadmap } from '../redux/roadmaps/types';
import { RootState } from '../redux/types';
import { chosenRoadmapSelector } from '../redux/roadmaps/selectors';

const Styles = styled.div`
  .navbar-nav {
    width: 100%;
    justify-content: flex-end;
  }

  .navbar {
    width: 100%;
  }

  .bottomborder {
    border: 0px;
    border-bottom: 1px solid black;
  }
`;

export const NavBar = () => {
  const { t } = useTranslation();

  const currentRoadmap = useSelector<RootState, Roadmap | undefined>(
    chosenRoadmapSelector,
    shallowEqual,
  );

  const getRenderRoadmapName: () => String = () => {
    if (currentRoadmap) return currentRoadmap.name;

    return t('Roadmap');
  };

  return (
    <Styles>
      <Navbar className="bottomborder">
        <Navbar.Brand href={paths.home}>VISDOM</Navbar.Brand>
        <Nav>
          <Nav.Link as={Link} to={paths.home}>
            <Trans i18nKey="Home" />
          </Nav.Link>
          <Nav.Link as={Link} to={paths.userInfo}>
            <Trans i18nKey="UserInfo" />
          </Nav.Link>{' '}
          <Nav.Link as={Link} to={paths.roadmapHome}>
            {getRenderRoadmapName()}
          </Nav.Link>
        </Nav>
      </Navbar>
    </Styles>
  );
};
