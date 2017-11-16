
export const getRecordListingState = (state) => (state.record.listing)
export const getSelectedRecordType = (state) => (getRecordListingState(state).type);
export const getRecordListIsFetching = (state) => (state.record.listing.isFetching);
export const getSelectedRecordFilters = (state) => (state.record.listing.filters);
