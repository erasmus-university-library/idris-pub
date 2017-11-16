import { handleActions } from 'redux-actions';
import CaleidoSDK from '../sdk.js';

const sdk = new CaleidoSDK();

const defaultState = {dev_user: {},
                      user: {token: null,
                             user: null},
                      error: null,
                      isFetching: false,
                      types: []};

const reducer = handleActions({
    SETTINGS_UPDATE: (state, action) => ({
        ...state,
        ...action.payload
    }),
    APP_CONFIG_RECEIVED: (state, action) => {
        const payload = {
            error: action.payload.error || null,
            types: action.payload.types,
            isFetching: false
        };
        if (state.user.token === null &&
            action.payload.dev_user){
            payload.user = {...action.payload.dev_user};
            sdk.token = action.payload.dev_user.token; // ugh..
        }
        return {
        ...state,
        ...payload
        }
    }
    }, defaultState);

export default reducer;