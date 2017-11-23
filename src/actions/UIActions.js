import { createAction } from 'redux-actions';

export const updateUI = createAction('UI_UPDATE');
export const changeAppTitle = createAction('APP_TITLE_CHANGE');
export const updateLoginForm = createAction('LOGIN_FORM_UPDATE');
export const flashMessage = createAction('MESSAGE_FLASH');
