import React, { Component } from 'react';
import { connect } from 'react-redux';

import RecordList from '../components/RecordList';
import { getRecordListingState, getRecordListIsFetching } from '../selectors/RecordSelectors';
import { getSelectedRecordListingSettings } from '../selectors/GlobalSelectors';
import { updateRecordListing, fetchRecordListing, selectRecord} from '../actions/RecordActions';

class FilteredRecordListing extends Component {
  render() {
      return <RecordList {...this.props} />
  }
}
const mapStateToProps = (state) => {
    return {
        ...getSelectedRecordListingSettings(state),
        showProgress: getRecordListIsFetching(state),
        ...getRecordListingState(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
        updateRecordListing: (newState) => {dispatch(updateRecordListing(newState))},
        selectRecord: (type, id) => {dispatch(selectRecord(type, id))},
        fetchRecordListing: (type, query, filters, offset, limit) => {dispatch(
            fetchRecordListing(type, query, filters, offset, limit))},
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(FilteredRecordListing);
