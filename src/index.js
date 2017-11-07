import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk'
import { createLogger } from 'redux-logger'
import {Provider} from 'react-redux';
import reducer from './reducers/index';

import './index.css';
import 'typeface-roboto'

import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';

const preloadedState = {};

let loggerMiddleware = createLogger();
let store = createStore(reducer,
                        preloadedState,
                        applyMiddleware(thunkMiddleware, loggerMiddleware));


ReactDOM.render(<Provider store={store}>
                  <App />
                </Provider>, document.getElementById('root'));
registerServiceWorker();
