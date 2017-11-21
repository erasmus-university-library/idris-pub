import React, { Component } from 'react';
import { connect } from 'react-redux';

import PersonEditor from '../components/PersonEditor';
import { getRecordDetailState } from '../selectors/RecordSelectors';
import { updateRecordDetail, submitRecord } from '../actions/RecordActions';


class RecordEditor extends Component {
  render() {
      if (this.props.type === 'person'){
          return <PersonEditor {...this.props} />
      }
      return null
  }
}
const mapStateToProps = (state) => {
    const recordState = getRecordDetailState(state);
    return {
        ...recordState,
        enableReinitialize: true,
        initialValues: recordState.record,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        closeDetailBar: () => {dispatch(updateRecordDetail({id: null, type:null}))},
        submitRecord: (type, id, values) => {dispatch(submitRecord(type, id, values))}
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(RecordEditor);
