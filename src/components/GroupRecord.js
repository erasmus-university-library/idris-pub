import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import GroupListing from './GroupListing';
import GroupDetail from './GroupDetail';

import { getListingState, getDetailState, getDetailSettings, getDetailSubmitErrors } from '../selectors';
import { updateListingState, fetchRecordListing,
         updateDetailState, fetchRecordDetail, postRecordDetail } from '../actions';


class GroupRecord extends Component {


    render() {
        const { match, listing, detail, detailErrors } = this.props;
        if (match.params.id === undefined){
            return <GroupListing {...listing}
                                  history={this.props.history}
                                  settings={this.props.detailSettings}
                                  onChange={this.props.updateListingState}
                                  onFetch={this.props.fetchRecordListing} />;
        } else {
            return <GroupDetail {...detail}
                                  initialValues={detail.record}
                                  enableReinitialize={true}
                                  submittedErrors={detailErrors}
                                  id={match.params.id}
                                  settings={this.props.detailSettings}
                                  history={this.props.history}
                                  onChange={this.props.updateGroupState}
                                  onFetch={this.props.fetchGroupRecord}
                                  onSubmit={this.props.postGroupRecord}

                                  memberListingState={this.props.memberListing}
                                  onMemberChange={this.props.updateMemberListingState}
                                  onMemberFetch={this.props.fetchMemberListing}

                                  subgroupListingState={this.props.subgroupListing}
                                  onSubgroupChange={this.props.updateSubgroupListingState}
                                  onSubgroupFetch={this.props.fetchSubgroupListing}
            />;
        }
    }
}


const mapStateToProps = state => {
    return {
        listing: getListingState('group', state),
        detail: getDetailState('group', state),
        memberListing: getListingState('membership', state),
        subgroupListing: getListingState('subgroup', state),
        detailErrors: getDetailSubmitErrors('group', state),
        detailSettings: getDetailSettings('group', state),
    };
}

const mapDispatchToProps = dispatch => {
    return {
        updateListingState: (state) => {dispatch(updateListingState('group', state))},
        fetchMemberListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('membership', query, filters, offset, limit))},
        fetchSubgroupListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('subgroup', query, filters, offset, limit))},
        updateMemberListingState: (state) => {dispatch(updateListingState('membership', state))},
        updateSubgroupListingState: (state) => {dispatch(updateListingState('subgroup', state))},
        fetchRecordListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('group', query, filters, offset, limit))},
        updateGroupState: (state) => {dispatch(updateDetailState('group', state))},
        fetchGroupRecord: (id) => {dispatch(fetchRecordDetail('group', id))},
        postGroupRecord: (id, data) => {dispatch(postRecordDetail('group', id, data))},
        updateMemberState: (state) => {dispatch(updateDetailState('membership', state))},
        fetchMemberRecord: (id) => {dispatch(fetchRecordDetail('membership', id))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GroupRecord));
