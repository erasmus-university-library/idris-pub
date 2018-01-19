import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { reduxBatch }  from '@manaflair/redux-batch';
import {Provider} from 'react-redux';

import './index.css';
import 'typeface-roboto';

import App from './components/App';

import {reducer as formReducer } from 'redux-form';
import appReducer from './reducers';

import { HashRouter as Router} from 'react-router-dom'

import registerServiceWorker from './registerServiceWorker';

const preloadedState = {};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(combineReducers({app: appReducer,
                                           form: formReducer}),
                          preloadedState,
                          composeEnhancers(reduxBatch, applyMiddleware(thunkMiddleware), reduxBatch));


ReactDOM.render(<Provider store={store}>
                 <Router>
                  <App />
                 </Router>
                </Provider>,
                document.getElementById('root'));
registerServiceWorker();
