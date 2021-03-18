import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import React from 'react';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { ModalRoot } from './components/modals/ModalRoot';
import { NavBar } from './components/NavBar';
import { i18config } from './i18/config';
import { MainRouter } from './routers/MainRouter';
import { RoadmapSidebar } from './components/RoadmapSidebar';
import classNames from 'classnames';
import css from './App.module.scss';

const classes = classNames.bind(css);

i18n.use(initReactI18next).init(i18config);
export const App = () => {
  return (
    <BrowserRouter>
      <ModalRoot />
      <MainRouter />
    </BrowserRouter>
  );
};
