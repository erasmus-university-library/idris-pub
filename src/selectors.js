
export const getAppTitle = (state) => (state.app.ui.title);
export const getSideBarOpen = (state) => (state.app.ui.sideBarOpen);
export const getAppState = (state) => (state.app.ui.appState);
export const getCustomTheme = (state) => (state.app.ui.theme);
export const getShowProgress = (state) => (state.app.ui.isFetching);
export const getFlashMessage = (state) => (state.app.ui.flashMessage || null);
export const getRedirectURL = (state) => (state.app.ui.redirectURL || null);
export const getLoggedInUser = (state) => (state.app.user.user || null);
export const getLoginState = (state) => (state.app.ui.login || {});

export const getListingState = (kind, state) => (state.app.record.listing[kind] || {});
export const getDetailSettings = (kind, state) => (state.app.record.settings[kind] || {});
export const getDetailState = (kind, state) => (state.app.record.detail[kind] || {});
export const getDetailSubmitErrors = (kind, state) => {
    if (state.form && state.form[kind]){
        return state.form[kind].submitErrors || null;
    }
    return null
};