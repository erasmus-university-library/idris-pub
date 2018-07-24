import { createAction } from 'redux-actions';
import { stopSubmit } from 'redux-form';

import IdrisSDK from './sdk.js';
const sdk = new IdrisSDK();

export const changeAppHeader = createAction('UI_UPDATE', (title, icon, seeAlsoURL, seeAlsoName) => ({title,
                                                                                                    icon: icon || null,
                                                                                                    seeAlsoURL: seeAlsoURL || null,
                                                                                                    seeAlsoName: seeAlsoName || null }));
export const changeAppState = createAction('UI_UPDATE', (state) => ({appState: state}));
export const closeSideBar = createAction('UI_UPDATE', () => ({sideBarOpen: false}));
export const openSideBar = createAction('UI_UPDATE', () => ({sideBarOpen: true}));
export const errorMessage = createAction('UI_UPDATE', (message) => ({error: message, isFetching: false}));
export const changeTheme = createAction('UI_UPDATE', (theme) => ({theme: theme}));
export const showProgress = createAction('UI_UPDATE', (bool) => ({isFetching: bool}));
export const flashMessage = createAction('UI_UPDATE', (message) => ({flashMessage: message}));
export const setRedirectURL = createAction('UI_UPDATE', (url) => ({redirectURL: url}));
export const updateLoginState = createAction('UI_LOGIN_UPDATE', (state) => (state));

export const updateSettingsState = createAction('RECORD_SETTINGS_UPDATE');
export const updateListingState = createAction('RECORD_LISTING_UPDATE',
                                               (kind, state) => (state),
                                               (kind, state) => (kind));
export const updateDetailState = createAction('RECORD_DETAIL_UPDATE',
                                              (kind, state) => (state),
                                              (kind, state) => (kind));

export const setUser = createAction('USER_UPDATE', (user) => {
    sdk.token = user.token;
    return user});



export const fetchRecordListing = (kind, query='', filters={}, offset=0, limit=null) => {
    if (limit === null){
        limit = 10;
    }
    if (filters.group_id === null){
        return dispatch => (dispatch(updateListingState(kind, {records: [], total: 0})))
    }
    return dispatch => {
        dispatch(showProgress(true));
        sdk.recordList(kind, query, filters, offset, limit)
            .then(response => response.json(),
                  error => dispatch(errorMessage(error)))
            .then(data => {
                if (data.status === 'ok'){
                    dispatch(updateListingState(kind, {records: data.snippets,
                                                       total: data.total}));
                    dispatch(showProgress(false));
                } else {
                    dispatch(errorMessage(data.errors[0].description));
                };
            });
      }
}

export const fetchRecordDetail = (kind, id) => {
    if (id === null){
        return dispatch => (dispatch(updateDetailState(kind, {record: {}})))
    }
    return dispatch => {
        dispatch(showProgress(true));
        sdk.record(kind, id)
            .then(response => response.json(),
                  error => dispatch(errorMessage(error)))
            .then(data => {
                if (data.id){
                    dispatch(updateDetailState(kind, {record: data}));
                    dispatch(showProgress(false));
                } else {
                    dispatch(errorMessage(data.errors[0].description));
                };
            });
      }
}

export const postRecordDetail = (kind, id, values) => {
    return dispatch => {
        dispatch(showProgress(true));
        sdk.recordSubmit(kind, id, values)
            .then(response => response.json(),
                  error => dispatch(errorMessage(error)))
            .then(data => {
                if (data.id){
                    dispatch(updateDetailState({record: data}));
                    dispatch(showProgress(false));
                    if (id === null){
                        if (kind === 'membership'){
                            // when adding a membership directly, redirect to person record
                            dispatch(setRedirectURL(`/record/person/${data.person_id}`));
                        } else {
                            dispatch(setRedirectURL(`/record/${kind}/${data.id}`));
                        }
                        dispatch(flashMessage(`Created new ${kind}`));
                    } else {
                        dispatch(flashMessage(`Updated ${kind} ${id}`))
                    }
                    dispatch(updateDetailState(kind, {record: data}));

                } else {
                    const formErrors = {_error: `Error Submitting ${kind} ${id}`};
                    // build an error object from the error strings, these can be nested and repeated
                    // for example: {name: accounts.3.type, description: Required}
                    for (const error of data.errors){
                        let parent = formErrors;
                        const parts = error.name.split('.');
                        if (error.location === 'request'){
                            dispatch(errorMessage(error.description));
                            break;
                        }
                        for (let i = 0; i < parts.length; i++){
                            if (i === parts.length - 1){
                                parent[parts[i]] = error.description
                            } else {
                                if (parent[parts[i]] === undefined){
                                    if (parseFloat(parts[i]) >= 0 && !Array.isArray(parent)){
                                        parent[parts[i]] = [];
                                    }
                                    parent[parts[i]] = {};
                                }
                                parent = parent[parts[i]];
                            }

                        }
                    }
                  dispatch(stopSubmit(kind, formErrors));
                  dispatch(showProgress(false));
                };
            });
    }

}
export const doLogin = (user, password) => {
    return dispatch => {
        dispatch(showProgress(true));
        return sdk.login(user, password)
                  .then(response => response.json(),
                        error => dispatch(errorMessage(error)))
                  .then(data => {
                      if (data.status === 'ok') {
                          dispatch(setUser({user: user,
                                            token: data.token}));
                          dispatch(showProgress(false));
                          dispatch(setRedirectURL(`/`));
                      } else {
                          dispatch(updateLoginState({error: data.errors[0].description}));
                          dispatch(showProgress(false));
                      }
                  });

    }
}

export const initializeApp = () => {
    return dispatch => {
        return sdk.clientConfig()
                  .then(response => response.json(),
                        error => dispatch(errorMessage(error)))
                  .then(data => {
                      if (data.status === 'ok') {
                          dispatch(changeAppHeader(data.repository.title, null));
                          dispatch(changeTheme(data.repository.theme));
                          dispatch(updateSettingsState(data.settings));
                          if (data.dev_user && data.dev_user.token){
                              dispatch(setUser(data.dev_user));
                          }
                          dispatch(changeAppState('initialized'));
                      } else {
                          dispatch(errorMessage(data));
                      }
                  });
    };
}
