//import React from "react";
import React, { Component } from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { reduxBatch }  from '@manaflair/redux-batch';
import {Provider} from 'react-redux';

import './index.css';
import 'typeface-roboto';

import EditorApp from './components/EditorApp';
import CourseApp from './components/CourseApp';
import HelloApp from './components/HelloApp';

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

class AppChooser extends Component {
  render() {
    const url = new URL(document.location);
    const token = url.searchParams.get('token');
    const embed = url.searchParams.get('embed') === 'true';
    let history = url.hash.substr(1) || null;
    if (history === '/') {
      history = null;
    }
    let path = url.pathname.split('/')[1];
    if (!path){
      path = 'root';
    }
    const App = this.props[path];
    return <App token={token} path={history} embed={embed}/>
  }
}

render(
  <Provider store={store}>
    <Router>
      <AppChooser edit={EditorApp} course={CourseApp} root={HelloApp} />
    </Router>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
