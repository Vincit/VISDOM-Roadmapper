import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import React from 'react';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import { ModalRoot } from './components/modals/ModalRoot';
import { i18config } from './i18/config';
import { MainRouter } from './routers/MainRouter';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#00a3ff' },
    secondary: { main: '#0ec679' },
  },
});

i18n.use(initReactI18next).init(i18config);
export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ModalRoot />
        <MainRouter />
      </BrowserRouter>
    </ThemeProvider>
  );
};
