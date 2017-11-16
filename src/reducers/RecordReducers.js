import { handleActions } from 'redux-actions';

const defaultState = {
    listing: {type: null,
              query: '',
              filters: {},
              records: [],
              total: 0,
              offset: 0,
              limit: 10,
              error: null,
              isFetching: false,
},
    detail: null
}

const reducer = handleActions({
    RECORD_UPDATE: (state, action) => ({
        ...state,
        ...action.payload
    }),
    RECORD_LISTING_UPDATE: (state, action) => ({
        ...state,
        listing: {...state.listing,
                  ...action.payload}
    }),
    RECORD_LISTING_FILTERS_UPDATE: (state, action) => ({
        ...state,
        listing: {...state.listing,
                  offset: 0,
                  filters: {...state.filters,
                            ...action.payload}
        }
    })
}, defaultState);

export default reducer;