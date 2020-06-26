import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import React from 'react';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { PaddingLessContainer } from './components/CommonLayoutComponents';
import { ModalRoot } from './components/ModalRoot';
import { NavBar } from './components/NavBar';
import { i18config } from './i18/config';
import { MainRouter } from './routers/MainRouter';

i18n.use(initReactI18next).init(i18config);

export const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <ModalRoot />
        <div className="h-100 d-flex flex-column">
          <NavBar />
          <PaddingLessContainer fluid className="flex-grow-1">
            <MainRouter />
          </PaddingLessContainer>
        </div>
      </BrowserRouter>
    </div>
  );
};
