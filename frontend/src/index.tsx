import React from 'react';
import ReactDOM from 'react-dom';
import { StylesProvider } from '@material-ui/core/styles';
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
    <React.StrictMode>
      <StylesProvider injectFirst>
        <App />
      </StylesProvider>
    </React.StrictMode>
  </Provider>,

  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
