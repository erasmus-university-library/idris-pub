import fetch from 'isomorphic-fetch'

export const CHANGE_APP_TITLE = 'CHANGE_APP_TITLE';

export const LOGINFORM_OPEN = 'LOGINFORM_OPEN';
export const LOGINFORM_CLOSE = 'LOGINFORM_CLOSE';
export const LOGINFORM_CHANGE = 'LOGINFORM_CHANGE';

export const SIDEBAR_OPEN = 'SIDEBAR_OPEN';
export const SIDEBAR_CLOSE = 'SIDEBAR_CLOSE';

export const REQUEST_TOKEN = 'REQUEST_TOKEN';
export const FETCH_TOKEN = 'FETCH_TOKEN';
export const RECEIVE_TOKEN = 'RECEIVE_TOKEN';
export const RECEIVE_TOKEN_ERROR = 'RECEIVE_TOKEN_ERROR';

export const changeAppTitle = (title) => {
    return {type: CHANGE_APP_TITLE, title};
}

export const requestToken = (user) => {
  return {
      type: REQUEST_TOKEN,
      user,
      token: null,
      isFetching: true};
}

export const fetchToken = (user, password) => {

  return dispatch => {
      dispatch(requestToken(user));
      return fetch('http://localhost:6543/api/v1/auth/login',
                   {method: 'POST',
                    mode: 'cors',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({user:user, password:password})})
          .then(response => response.json(),
                error => dispatch(receiveTokenError(user, error)))
          .then(data => {
              if (data.status === 'ok'){
                  dispatch(receiveToken(user, data.token));
                  dispatch(loginFormClose())
              } else {
                  dispatch(receiveTokenError(user, data.errors[0].description));
              };});
  }
}

export const receiveToken = (user, token) => {
    return {
        type: RECEIVE_TOKEN,
        user,
        token,
        errorMessage: '',
        isFetching: false}
}

export const receiveTokenError = (user, errorMessage) => {
    return {
        type: RECEIVE_TOKEN_ERROR,
        user,
        token:null,
        errorMessage: errorMessage,
        isFetching: false}
}

export const loginFormOpen = () => {
    return {
        type: LOGINFORM_OPEN,
        open: true}
}

export const loginFormClose = () => {
    return {
        type: LOGINFORM_CLOSE,
        open: false}
}

export const loginFormChange = (key, value) => {
    return {type: LOGINFORM_CHANGE, key, value}
}

export const sideBarOpen = () => {
    return {
        type: SIDEBAR_OPEN,
        open: true}
}

export const sideBarClose = () => {
    return {
        type: SIDEBAR_CLOSE,
        open: false}
}
