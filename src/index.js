import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { reduxBatch }  from '@manaflair/redux-batch';
import {Provider} from 'react-redux';

import './index.css';
import 'typeface-roboto';

import App from './containers/AppContainer';
import settingsReducer from './reducers/SettingsReducers';
import uiReducer from './reducers/UIReducers';
import recordReducer from './reducers/RecordReducers';

import registerServiceWorker from './registerServiceWorker';

const preloadedState = {};

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(combineReducers({settings: settingsReducer,
                                           ui: uiReducer,
                                           record: recordReducer}),
                          preloadedState,
                          composeEnhancers(reduxBatch, applyMiddleware(thunkMiddleware), reduxBatch));


ReactDOM.render(<Provider store={store}>
                  <App />
                </Provider>,
                document.getElementById('root'));
registerServiceWorker();
