import CaleidoSDK from '../sdk.js';

export const CHANGE_APP_TITLE = 'CHANGE_APP_TITLE';
export const INITIALIZE_APP = 'INITIALIZE_APP';
export const RECEIVE_CLIENT_CONFIG = 'RECEIVE_CLIENT_CONFIG'
export const RECEIVE_CLIENT_CONFIG_ERROR = 'RECEIVE_CLIENT_CONFIG_ERROR'

export const LOGINFORM_OPEN = 'LOGINFORM_OPEN';
export const LOGINFORM_CLOSE = 'LOGINFORM_CLOSE';
export const LOGINFORM_CHANGE = 'LOGINFORM_CHANGE';

export const SIDEBAR_OPEN = 'SIDEBAR_OPEN';
export const SIDEBAR_CLOSE = 'SIDEBAR_CLOSE';

export const REQUEST_TOKEN = 'REQUEST_TOKEN';
export const FETCH_TOKEN = 'FETCH_TOKEN';
export const INVALIDATE_TOKEN = 'INVALIDATE_TOKEN';
export const RECEIVE_TOKEN = 'RECEIVE_TOKEN';
export const RECEIVE_TOKEN_ERROR = 'RECEIVE_TOKEN_ERROR';

export const FETCH_RECORD_TYPES = 'FETCH_TYPES';
export const RECEIVE_TYPES = 'RECEIVE_TYPES';

export const CHANGE_RECORD_TYPE = 'CHANGE_RECORD_TYPE';
export const FETCH_RECORD_LIST = 'FETCH_RECORD_LIST';
export const RECEIVE_RECORD_LIST = 'RECEIVE_RECORD_LIST';
export const RECEIVE_RECORD_LIST_ERROR = 'RECEIVE_RECORD_LIST_ERROR';
export const UPDATE_RECORD_LIST_QUERY = 'UPDATE_RECORD_LIST_QUERY';

const sdk = new CaleidoSDK();


export const initializeApp = () => {
    return dispatch => {
      return sdk.clientConfig()
          .then(response => response.json(),
                error => dispatch(receiveClientConfigError(error)))
          .then(data => {
              if (data.status === 'ok'){
                  dispatch(receiveClientConfig(data));
                  if (data.dev_user){
                      dispatch(receiveToken(data.dev_user.user, data.dev_user.token));
                      dispatch(sideBarOpen());
                  }

              } else {
                  dispatch(receiveClientConfigError(data.errors[0].description));
              };
          });
    }

}
export const receiveClientConfig = (config) => {
    return {type: RECEIVE_CLIENT_CONFIG,
            config: config}
}


export const receiveClientConfigError = (error) => {
    return {type: RECEIVE_CLIENT_CONFIG_ERROR,
            error: error}
}

export const fetchRecordList = (type, query='', filters={}, offset=0, limit=10, timeout=0) => {
    console.log('fetchRecordList with timeout', timeout);
    return dispatch => {
      if (timeout > 0){
          let timeoutId = setTimeout(() => dispatch(fetchRecordList(
              type, query, filters, offset, limit, -1)), timeout);
          dispatch(updateRecordListQuery(query, filters, timeoutId));
      } else {
        if (!timeout){
            dispatch(updateRecordListQuery(query, filters));
        }
        return sdk.recordList(type, query, filters, offset, limit)
            .then(response => response.json(),
                  error => dispatch(receiveRecordListError(type, error)))
            .then(data => {
                if (data.status === 'ok'){
                    dispatch(receiveRecordList(type, data.records, data.total, offset, limit));
                } else {
                    dispatch(receiveRecordListError(type, data.errors[0].description));
                };
            });
      }
    }

}
export const updateRecordListQuery = (query, filters={}, timeoutId=null) => {
    return {type: UPDATE_RECORD_LIST_QUERY,
            query,
            filters,
            timeoutId: timeoutId};
}

export const receiveRecordList = (type, records, total, offset, limit) => {
    return {type: RECEIVE_RECORD_LIST,
            recordType: type,
            records,
            total,
            offset,
            page: offset / limit,
            limit};
}


export const receiveRecordListError = (type, error) => {
    let msg = `Error receiving record list for type '${type}': ${error}`;
    return {type: RECEIVE_RECORD_LIST_ERROR, error: msg};
}

export const changeRecordType = (type) => {
    return {type: CHANGE_RECORD_TYPE, typeId: type};
}

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
      return sdk.login(user, password)
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

export const invalidateToken = () => {
    sdk.token = null;
    return {type: INVALIDATE_TOKEN}
}

export const receiveToken = (user, token) => {
    sdk.token = token
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
