import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk'
import {Provider} from 'react-redux';
import reducer from './reducers/index';

import './index.css';
import 'typeface-roboto'

import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';

const preloadedState = {};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer,
                          preloadedState,
                          composeEnhancers(applyMiddleware(thunkMiddleware)));


ReactDOM.render(<Provider store={store}>
                  <App />
                </Provider>, document.getElementById('root'));
registerServiceWorker();
