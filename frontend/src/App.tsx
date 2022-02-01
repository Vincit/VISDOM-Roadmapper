import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { ModalRoot } from './components/modals/ModalRoot';
import { SocketListener } from './components/SocketListener';
import { i18config } from './i18/config';
import { MainRouter } from './routers/MainRouter';

i18n.use(initReactI18next).init(i18config);
export const App = () => {
  return (
    <>
      <SocketListener />
      <BrowserRouter>
        <ModalRoot />
        <MainRouter />
      </BrowserRouter>
    </>
  );
};
