import React from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { i18config } from './i18/config';
import { NavBar } from './components/NavBar';
import { MainRouter } from './routers/MainRouter';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ModalRoot } from './components/ModalRoot';
import {
  FullHeightContainer,
  FullHeightRow,
} from './components/CommonLayoutComponents';

i18n.use(initReactI18next).init(i18config);

export const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <ModalRoot />
        <NavBar />
        <FullHeightContainer fluid>
          <FullHeightRow>
            <MainRouter />
          </FullHeightRow>
        </FullHeightContainer>
      </BrowserRouter>
    </div>
  );
};
