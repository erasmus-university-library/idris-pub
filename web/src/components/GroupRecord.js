import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import GroupListing from './GroupListing';
import GroupDetail from './GroupDetail';

import { getListingState, getDetailState, getDetailSettings, getDetailSubmitErrors } from '../selectors';
import { updateListingState, fetchRecordListing,
         updateDetailState, fetchRecordDetail, postRecordDetail, deleteRecordDetail,
         changeAppHeader } from '../actions';
import { getFormValues } from 'redux-form';


class GroupRecord extends Component {


    render() {
        const { match, listing, detail, detailErrors } = this.props;
        if (match.params.id === undefined){
            return <GroupListing {...listing}
                                  history={this.props.history}
                                  settings={this.props.detailSettings}
                                  changeAppHeader={this.props.changeAppHeader}
                                  onChange={this.props.updateListingState}
                                  onFetch={this.props.fetchRecordListing} />;
        } else {
            return <GroupDetail {...detail}
                                  initialValues={detail.record}
                                  changeAppHeader={this.props.changeAppHeader}
                                  enableReinitialize={true}
                                  submittedErrors={detailErrors}
                                  id={match.params.id}
                                  formValues={this.props.formValues}
                                  settings={this.props.detailSettings}
                                  history={this.props.history}
                                  onDetailChange={this.props.updateGroupState}
                                  onFetch={this.props.fetchGroupRecord}
                                  onSubmit={this.props.postGroupRecord}
                        	  onDelete={this.props.deleteGroupRecord}

                                  memberListingState={this.props.memberListing}
                                  onMemberChange={this.props.updateMemberListingState}
                                  onMemberFetch={this.props.fetchMemberListing}
                                  onMemberAdd={this.props.postMembershipRecord}

                                  subgroupListingState={this.props.subgroupListing}
                                  onSubgroupChange={this.props.updateSubgroupListingState}
                                  onSubgroupFetch={this.props.fetchSubgroupListing}

                                  workSettings={this.props.workSettings}
                                  affiliationListingState={this.props.affiliationListing}
                                  onAffiliationChange={this.props.updateAffiliationListingState}
                                  onAffiliationFetch={this.props.fetchAffiliationListing}

            />;
        }
    }
}


const mapStateToProps = state => {
    return {
        listing: getListingState('group', state),
        detail: getDetailState('group', state),
        memberListing: getListingState('membership', state),
        affiliationListing: getListingState('workAffiliation', state),
        subgroupListing: getListingState('subgroup', state),
        detailErrors: getDetailSubmitErrors('group', state),
        detailSettings: getDetailSettings('group', state),
        workSettings: getDetailSettings('work', state),
        formValues: getFormValues('group')(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
        changeAppHeader: (title) => {dispatch(changeAppHeader(title))},
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
        fetchAffiliationListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('workAffiliation', query, filters, offset, limit))},
        updateAffiliationListingState: (state) => {dispatch(updateListingState('workAffiliation', state))},
        fetchGroupRecord: (id) => {dispatch(fetchRecordDetail('group', id))},
        postGroupRecord: (id, data) => {dispatch(postRecordDetail('group', id, data))},
        deleteGroupRecord: (id) => {dispatch(deleteRecordDetail('group', id))},
        postMembershipRecord: (group_id, person_id) => {dispatch(postRecordDetail('membership', null, {group_id, person_id}))},
        updateMemberState: (state) => {dispatch(updateDetailState('membership', state))},
        fetchMemberRecord: (id) => {dispatch(fetchRecordDetail('membership', id))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GroupRecord));
