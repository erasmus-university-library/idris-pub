import { createAction } from 'redux-actions';

import CaleidoSDK from '../sdk.js';

export const updateSettings = createAction('SETTINGS_UPDATE');
export const receivedAppConfig = createAction('APP_CONFIG_RECEIVED');


export const loginUser = (user, password) => {
    return dispatch => {
        const sdk = new CaleidoSDK();
        return sdk.login(user, password)
                  .then(response => response.json(),
                        error => dispatch(updateSettings({error: error})))
                  .then(data => {
                      if (data.status === 'ok') {
                          sdk.token = data.token;
                          dispatch(updateSettings({user: {token: data.token,
                                                          user: user}}));
                      } else {
                          dispatch(updateSettings({user: {error: data.errors[0].description,
                                                          user: null,
                                                          token: null}}));
                      }
                  });
    };
}


export const fetchAppConfig = () => {
    return dispatch => {
        dispatch(updateSettings({isFetching: true}));
        const sdk = new CaleidoSDK();
        return sdk.clientConfig()
                  .then(response => response.json(),
                        error => dispatch(updateSettings({error: error})))
                  .then(data => {
                      if (data.status === 'ok') {
                          dispatch(receivedAppConfig(data));
                      } else {
                          dispatch(receivedAppConfig({error: data}))
                      }
                  });
    };
};
