import React from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import { Col, Row } from 'react-bootstrap';
import { BrowserRouter } from 'react-router-dom';
import { i18config } from './i18/config';
import { SideBar } from './components/SideBar';
import { NavBar } from './components/NavBar';
import { Router } from './router/Router';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ModalRoot } from './components/ModalRoot';

i18n.use(initReactI18next).init(i18config);

const FullHeightContainer = styled(Container)`
  min-height: 100%;
  height: 100%;
`;

const FullHeightRow = styled(Row)`
  min-height: 100%;
  height: 100%;
`;

const ContentColumn = styled(Col)`
  margin: 0px;
  padding: 0px;
`;

export const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <FullHeightContainer fluid>
          <FullHeightRow>
            <SideBar />
            <ContentColumn>
              <Router />
              <ModalRoot />
            </ContentColumn>
          </FullHeightRow>
        </FullHeightContainer>
      </BrowserRouter>
    </div>
  );
};
