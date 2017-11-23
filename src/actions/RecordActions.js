import { createAction } from 'redux-actions';

import CaleidoSDK from '../sdk.js';

import { stopSubmit } from 'redux-form';

const sdk = new CaleidoSDK();

export const updateRecords = createAction('RECORD_UPDATE');
export const updateRecordListing = createAction('RECORD_LISTING_UPDATE');
export const updateRecordListingFilters = createAction('RECORD_LISTING_FILTERS_UPDATE');
export const updateRecordDetail = createAction('RECORD_DETAIL_UPDATE');

export const setRecordTypeFilter = (recordFilter, recordFilterValue) => {
    return dispatch => {
        dispatch(updateRecordListingFilters({[recordFilter]: recordFilterValue}));
    }
}
export const selectRecordType = (recordType) => {
    return dispatch => {
        dispatch(updateRecordListing({type: recordType,
                                      offset: 0}))
        dispatch(updateRecordDetail({type: null,
                                     id: null,
                                     openedAccordion: recordType}))
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
export const selectRecord = (recordType, recordId) => {
    return dispatch => {
        dispatch(updateRecordDetail({type: recordType,
                                     id: recordId,
                                     isFetching: true}))
        dispatch(fetchRecord(recordType, recordId));
    }
}

export const fetchRecord = (type, id) => {
    return dispatch => {
        sdk.record(type, id)
            .then(response => response.json(),
                  error => dispatch(updateRecordDetail({error: error,
                                                        isFetching: false})))
            .then(data => {
                if (data.id){
                    dispatch(updateRecordDetail({record: data,
                                                 isFetching: false,
                                                 error: null}));
                } else {
                    dispatch(updateRecordDetail({error: data.errors[0].description,
                                                 isFetching: false}));
                };
            });
    }

}

export const submitRecord = (type, id, values) => {
    return dispatch => {
        dispatch(updateRecordDetail({isFetching: true}))
        sdk.recordSubmit(type, id, values)
            .then(response => response.json(),
                  error => dispatch(updateRecordDetail({error: error,
                                                        isFetching: false})))
            .then(data => {
                if (data.id){
                    dispatch(updateRecordDetail({record: data,
                                                 flash: `Updated ${type} ${id}`,
                                                 isFetching: false,
                                                 error: null}));
                } else {
                    const formErrors = {_error: `Error Submitting ${type} ${id}`};
                    // build an error object from the error strings, these can be nested and repeated
                    // for example: {name: accounts.3.type, description: Required}
                    for (const error of data.errors){
                        let parent = formErrors;
                        const parts = error.name.split('.');
                        for (let i = 0; i < parts.length; i++){
                            if (i === parts.length - 1){
                                parent[parts[i]] = error.description
                            } else {
                                if (parent[parts[i]] === undefined){
                                    if (parseFloat(parts[i]) >= 0 && !Array.isArray(parent)){
                                        parent[parts[i]] = [];
                                    }
                                    parent[parts[i]] = {};
                                }
                                parent = parent[parts[i]];
                            }

                        }
                    }
                    dispatch(stopSubmit(type, formErrors));
                    dispatch(updateRecordDetail({isFetching: false}));
                };
            });
    }

}