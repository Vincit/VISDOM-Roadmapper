import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import React from 'react';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import 'typeface-anonymous-pro';
import 'typeface-roboto';
import './App.css';
import { PaddinglessContainer } from './components/CommonLayoutComponents';
import { GlobalStyles } from './components/GlobalStyles';
import { ModalRoot } from './components/modals/ModalRoot';
import { NavBar } from './components/NavBar';
import { i18config } from './i18/config';
import { MainRouter } from './routers/MainRouter';

i18n.use(initReactI18next).init(i18config);

export const App = () => {
  return (
    <GlobalStyles className="App">
      <BrowserRouter>
        <ModalRoot />
        <div className="h-100 d-flex flex-column">
          <NavBar />
          <PaddinglessContainer fluid className="flex-grow-1">
            <MainRouter />
          </PaddinglessContainer>
        </div>
      </BrowserRouter>
    </GlobalStyles>
  );
};
