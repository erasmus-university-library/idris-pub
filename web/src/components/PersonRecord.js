import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import PersonListing from './PersonListing';
import PersonDetail from './PersonDetail';

import { getListingState, getDetailState, getDetailSettings, getDetailSubmitErrors } from '../selectors';
import { updateListingState, fetchRecordListing,
         updateDetailState, fetchRecordDetail, postRecordDetail } from '../actions';
import { getFormValues } from 'redux-form';


class PersonRecord extends Component {


    render() {
        const { match, listing, detail, detailErrors } = this.props;
        if (match.params.id === undefined){
            return <PersonListing {...listing}
                                  history={this.props.history}
                                  onChange={this.props.updateListingState}
                                  onFetch={this.props.fetchRecordListing} />;
        } else {
            return <PersonDetail {...detail}
                                  initialValues={detail.record}
                                  enableReinitialize={true}
                                  submittedErrors={detailErrors}
                                  id={match.params.id}
                                  formValues={this.props.formValues}
                                  settings={this.props.detailSettings}
                                  history={this.props.history}
                                  onDetailChange={this.props.updateDetailState}
                                  onFetch={this.props.fetchRecordDetail}
                                  onSubmit={this.props.postRecordDetail}

                                  workSettings={this.props.workSettings}
                                  contributorListingState={this.props.contributorListing}
                                  onContributorChange={this.props.updateContributorListingState}
                                  onContributorFetch={this.props.fetchContributorListing}

            />;
        }
    }
}


const mapStateToProps = state => {
    return {
        listing: getListingState('person', state),
        contributorListing: getListingState('workContributor', state),
        detail: getDetailState('person', state),
        detailErrors: getDetailSubmitErrors('person', state),
        detailSettings: getDetailSettings('person', state),
        workSettings: getDetailSettings('work', state),
        formValues: getFormValues('person')(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
        updateListingState: (state) => {dispatch(updateListingState('person', state))},
        fetchRecordListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('person', query, filters, offset, limit))},
        fetchContributorListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('workContributor', query, filters, offset, limit))},
        updateContributorListingState: (state) => {dispatch(updateListingState('workContributor', state))},
        updateDetailState: (state) => {dispatch(updateDetailState('person', state))},
        fetchRecordDetail: (id) => {dispatch(fetchRecordDetail('person', id))},
        postRecordDetail: (id, data) => {dispatch(postRecordDetail('person', id, data))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PersonRecord));
