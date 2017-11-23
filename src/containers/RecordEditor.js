import React, { Component } from 'react';
import { connect } from 'react-redux';

import PersonEditor from '../components/PersonEditor';
import GroupEditor from '../components/GroupEditor';

import { getRecordDetailState } from '../selectors/RecordSelectors';
import { getSubmittedErrors, getSelectedRecordTypeSettings } from '../selectors/GlobalSelectors';
import { updateRecordDetail, submitRecord } from '../actions/RecordActions';


class RecordEditor extends Component {
  render() {
      switch (this.props.type) {
          case 'person': return <PersonEditor {...this.props} />;
          case 'group': return <GroupEditor {...this.props} />;
          default: return null;
      }
  }
}
const mapStateToProps = (state) => {
    const recordState = getRecordDetailState(state);
    return {
        ...recordState,
        settings: getSelectedRecordTypeSettings(state),
        submittedErrors: getSubmittedErrors(state),
        enableReinitialize: true,
        initialValues: recordState.record,
    };
}

const mapDispatchToProps = dispatch => {
    return {
        closeDetailBar: () => {dispatch(updateRecordDetail({id: null, type:null}))},
        submitRecord: (type, id, values) => {dispatch(submitRecord(type, id, values))},
        updateRecordDetail: (state) => {dispatch(updateRecordDetail(state))}
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(RecordEditor);
