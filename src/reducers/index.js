import { combineReducers } from 'redux'
import { reducer as uiReducer } from 'redux-ui'
import { CHANGE_APP_TITLE,
         REQUEST_TOKEN, RECEIVE_TOKEN, RECEIVE_TOKEN_ERROR, INVALIDATE_TOKEN,
         LOGINFORM_OPEN, LOGINFORM_CLOSE, LOGINFORM_CHANGE,
         SIDEBAR_OPEN, SIDEBAR_CLOSE,
         RECEIVE_TYPES ,
         CHANGE_RECORD_TYPE, RECEIVE_RECORD_LIST, UPDATE_RECORD_LIST_QUERY,
         RECEIVE_CLIENT_CONFIG, RECEIVE_CLIENT_CONFIG_ERROR} from '../actions'

const initialState = {
    title: 'EUR Affiliations',
    config: {error: null,
             types: []},
    auth: {user:null,
           token:null,
           errorMessage: '',
           isFetching: false},
    sideBar: {open: false,
              types: []},
    loginForm: {user: '',
                password: '',
                open: false,
                error: ''},
    recordList: {type: null,
                 records: [],
                 total: 0,
                 offset: 0,
                 page: 0,
                 limit: 10}
}

const appReducer = (state = initialState, action) => {
    switch (action.type) {
        case RECEIVE_CLIENT_CONFIG:
            return {...state,
                    config: action.config}
        case RECEIVE_CLIENT_CONFIG_ERROR:
            return {...state,
                    config: {error: action.error, types: []}
            }
        case UPDATE_RECORD_LIST_QUERY:
            if (state.recordList.timeoutId){
                clearTimeout(state.recordList.timeoutId);
            }
            return {...state,
                    recordList: {...state.recordList,
                                 query: action.query,
                                 timeoutId: action.timeoutId}
            }
        case RECEIVE_RECORD_LIST:
            return {...state,
                    recordList: {...state.recordList,
                                 records: action.records,
                                 total: action.total,
                                 offset: action.offset,
                                 limit: action.limit,
                                 page: action.page,
                                 label: state.selectedRecordType.label,
                                 label_plural: state.selectedRecordType.label_plural,
                                 type: action.recordType}
            };
        case CHANGE_RECORD_TYPE:
            return {...state,
                    selectedRecordType: action.recordType};
        case RECEIVE_TYPES:
            return {
                ...state,
                sideBar: {...state.sideBar,
                          types: action.types}
            };
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
        case INVALIDATE_TOKEN:
            return {
                ...state,
                recordList: {},
                auth: {...state.auth,
                       user: null,
                       token: null,
                       isFetching: false},
                loginForm: {...state.loginForm,
                            user: '',
                            password: '',
                            error: ''}
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
