
export const getAuthenticatedUserId = (state) => (state.settings.user.user || null);
export const getSettingsError = (state) => (state.settings.error || null);
export const getSettingsIsFetching = (state) => (state.settings.isFetching);
export const getRecordTypes = (state) => {
    return [...state.settings.types];
}