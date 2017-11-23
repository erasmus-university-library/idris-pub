import { handleActions } from 'redux-actions';

const defaultState = {
    title: null,
    sideBarOpen: false,
    flashMessage: null,
    loginForm: {open: false,
                user: '',
                error: '',
                password: ''}
};

const reducer = handleActions({
    UI_UPDATE: (state, action) => ({
        ...state,
        ...action.payload
    }),
    APP_TITLE_CHANGE: (state, action) => ({
        ...state,
        title: action.payload
    }),
    LOGIN_FORM_UPDATE: (state, action) => ({
        ...state,
        loginForm: {...state.loginForm,
                    ...action.payload}
    }),
    MESSAGE_FLASH: (state, action) => ({
        ...state,
        flashMessage: action.payload
    })
    }, defaultState);

export default reducer;