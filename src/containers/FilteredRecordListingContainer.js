import React, { Component } from 'react';
import { connect } from 'react-redux';

import RecordList from '../components/RecordList';
import { getRecordListingState, getRecordListIsFetching } from '../selectors/RecordSelectors';
import { getSelectedRecordListingFields } from '../selectors/GlobalSelectors';
import { updateRecordListing, fetchRecordListing } from '../actions/RecordActions';

class FilteredRecordListing extends Component {
  render() {
      return <RecordList {...this.props} />
  }
}
const mapStateToProps = (state) => {
    return {
        fields: getSelectedRecordListingFields(state),
        showProgress: getRecordListIsFetching(state),
        ...getRecordListingState(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
        updateRecordListing: (newState) => {dispatch(updateRecordListing(newState))},
        fetchRecordListing: (type, query, filters, offset, limit) => {dispatch(
            fetchRecordListing(type, query, filters, offset, limit))},
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(FilteredRecordListing);
