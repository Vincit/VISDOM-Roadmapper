import { StrictMode } from 'react';
import ReactDOM from 'react-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { App } from './App';
import { store } from './redux/index';
import * as serviceWorker from './serviceWorker';
import './global.scss';
import './shared.scss';
import 'typeface-anonymous-pro';
import 'typeface-work-sans';

ReactDOM.render(
  <Provider store={store}>
    <StrictMode>
      <StyledEngineProvider injectFirst>
        <App />
      </StyledEngineProvider>
    </StrictMode>
  </Provider>,

  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
