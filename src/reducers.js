import { handleActions } from 'redux-actions';

const defaultState = {
    ui: {title: null,
         sideBarOpen: false,
         appState: 'initializing',
         error: null,
         theme: {primary: null,
                 accent: null}
    },
    user: {user: null,
           token: null},
    record: {
        settings: {},
        listing: {},
        search: {},
        detail: {}
    }
};

const reducer = handleActions({
    UI_UPDATE: (state, action) => ({
        ...state,
        ui: {...state.ui,
             ...action.payload}
    }),
    UI_LOGIN_UPDATE: (state, action) => ({
        ...state,
        ui: {...state.ui,
             login: {...state.ui.login,
                     ...action.payload}}
    }),
    USER_UPDATE: (state, action) => ({
        ...state,
        record: {...state.record,
                 listing: {},
                 search: {},
                 detail: {}},
        user: {...state.user,
               ...action.payload}
    }),
    RECORD_SETTINGS_UPDATE: (state, action) => ({
        ...state,
        record: {...state.record,
                 settings: {...state.record.settings,
                            ...action.payload}
        }
    }),
    RECORD_LISTING_UPDATE: (state, action) => ({
        ...state,
        record: {...state.record,
                listing: {...state.record.listing,
                          [action.meta]: {...state.record.listing[action.meta],
                                          ...action.payload
                          }
                }
        }
    }),
    RECORD_DETAIL_UPDATE: (state, action) => ({
        ...state,
        record: {...state.record,
                detail: {...state.record.detail,
                          [action.meta]: {...state.record.detail[action.meta],
                                          ...action.payload
                          }
                }
        }
    }),
}, defaultState);

export default reducer