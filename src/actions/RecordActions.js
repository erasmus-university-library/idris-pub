import { createAction } from 'redux-actions';

import CaleidoSDK from '../sdk.js';

const sdk = new CaleidoSDK();

export const updateRecords = createAction('RECORD_UPDATE');
export const updateRecordListing = createAction('RECORD_LISTING_UPDATE');
export const updateRecordListingFilters = createAction('RECORD_LISTING_FILTERS_UPDATE');

export const setRecordTypeFilter = (recordFilter, recordFilterValue) => {
    return dispatch => {
        dispatch(updateRecordListingFilters({[recordFilter]: recordFilterValue}));
    }
}
export const selectRecordType = (recordType) => {
    return dispatch => {
        dispatch(updateRecordListing({type: recordType,
                                      offset: 0}))
    }
}

export const fetchRecordListing = (type, query='', filters={}, offset=0, limit=10) => {
    return dispatch => {
        sdk.recordList(type, query, filters, offset, limit)
            .then(response => response.json(),
                  error => dispatch(updateRecordListing({error: error,
                                                         isFetching: false})))
            .then(data => {
                if (data.status === 'ok'){
                    dispatch(updateRecordListing({records: data.records,
                                                  isFetching: false,
                                                  error: null,
                                                  total: data.total}));
                } else {
                    dispatch(updateRecordListing({error: data.errors[0].description,
                                                  isFetching: false}));
                };
            });
      }
}
