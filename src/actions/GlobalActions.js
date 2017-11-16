import { updateLoginForm, updateUI } from './UIActions'
import { updateSettings } from './SettingsActions'

export const logoutUser = () => {
    return dispatch => {
        dispatch(updateSettings({user: {user: null,
                                        token: null}}));
        dispatch(updateUI({sideBarOpen: false}));
        dispatch(updateLoginForm({open: false, user: '', password: ''}));
    }
}
