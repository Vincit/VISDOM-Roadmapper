import 'bootstrap/dist/css/bootstrap.min.css';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { ModalRoot } from './components/modals/ModalRoot';
import { i18config } from './i18/config';
import { MainRouter } from './routers/MainRouter';
import { userInfoSelector } from './redux/user/selectors';

i18n.use(initReactI18next).init(i18config);
export const App = () => {
  const userInfo = useSelector(userInfoSelector);
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userInfo) {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
      return;
    }

    if (!socket.current) {
      console.log('Trying to establish socketIo communication');
      socket.current = io(process.env.REACT_APP_API_BASE_URL!, {
        withCredentials: true,
      });

      socket.current.on('connect', () => {
        console.log(`Socket connected`);
      });

      socket.current.on('connect_error', (error) => {
        console.log(`Error connecting socket: ${error}`);
      });
    }
  }, [userInfo]);

  return (
    <BrowserRouter>
      <ModalRoot />
      <MainRouter />
    </BrowserRouter>
  );
};
