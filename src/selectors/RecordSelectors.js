
export const getSelectedRecordType = (state) => (getRecordListingState(state).type);
export const getRecordListIsFetching = (state) => (state.record.listing.isFetching);
export const getSelectedRecordFilters = (state) => (state.record.listing.filters);
export const getRecordListingState = (state) => (state.record.listing)
export const getRecordDetailState = (state) => (state.record.detail)
export const getSelectedRecordId = (state) => (state.record.detail.id || null);
export const getRecordDetailIsFetching = (state) => (state.record.detail.isFetching);