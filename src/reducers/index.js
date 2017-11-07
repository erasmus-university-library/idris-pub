import { combineReducers } from 'redux'
import { reducer as uiReducer } from 'redux-ui'
import { CHANGE_APP_TITLE,
         REQUEST_TOKEN, RECEIVE_TOKEN, RECEIVE_TOKEN_ERROR,
         LOGINFORM_OPEN, LOGINFORM_CLOSE, LOGINFORM_CHANGE,
         SIDEBAR_OPEN, SIDEBAR_CLOSE } from '../actions'

const initialState = {
    title: 'EUR Affiliations',
    auth: {user:null,
           token:null,
           errorMessage: '',
           isFetching: false},
    sideBar: {open: false},
    loginForm: {user: '',
                password: '',
                open: false,
                error: ''}
}

const appReducer = (state = initialState, action) => {
    switch (action.type) {
        case CHANGE_APP_TITLE:
            return {
                ...state,
                title: action.title};

        case REQUEST_TOKEN:
            return {
                ...state,
                auth: {...state.auth,
                       isFetching: true}};

        case RECEIVE_TOKEN:
            return {
                ...state,
                auth: {...state.auth,
                       user: action.user,
                       token: action.token,
                       isFetching: false}};
        case RECEIVE_TOKEN_ERROR:
            return {
                ...state,
                auth: {...state.auth,
                       user: null,
                       token: null,
                       isFetching: false},
                loginForm: {...state.loginForm,
                            error: action.errorMessage}
                };
        case LOGINFORM_OPEN:
        case LOGINFORM_CLOSE:
            return {
                ...state,
                loginForm: {...state.loginForm,
                            open: action.open}
                };
        case LOGINFORM_CHANGE:
            let result = {
                ...state,
                loginForm: {...state.loginForm,
                            [action.key]: action.value}
                };
            return result
        case SIDEBAR_OPEN:
        case SIDEBAR_CLOSE:
            return {
                ...state,
                sideBar: {...state.sideBar,
                          open: action.open}
                };
        default:
            return state
    }

}

export default combineReducers({app: appReducer, ui: uiReducer});
