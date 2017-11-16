import React, { Component } from 'react';
import { connect } from 'react-redux';

import RecordTypes from '../components/RecordTypes';

import { getTypeNavigation } from '../selectors/GlobalSelectors';
import { selectRecordType, setRecordTypeFilter } from '../actions/RecordActions';

class FilteredRecordTypes extends Component {
  componentDidMount() {
  }
  render() {
      return <RecordTypes {...this.props} />
  }
}
const mapStateToProps = state => {
    return {
        types: getTypeNavigation(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
        recordTypeClick: (typeId) => {dispatch(selectRecordType(typeId))},
        recordTypeFilterUpdate: (filterId, filterValue) => {
            dispatch(setRecordTypeFilter(filterId, filterValue))}

    };
}
export default connect(mapStateToProps, mapDispatchToProps)(FilteredRecordTypes);
