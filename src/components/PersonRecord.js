import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import PersonListing from './PersonListing';
import PersonDetail from './PersonDetail';

import { getListingState, getDetailState, getDetailSettings, getDetailSubmitErrors } from '../selectors';
import { updateListingState, fetchRecordListing,
         updateDetailState, fetchRecordDetail, postRecordDetail } from '../actions';


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
                                  settings={this.props.detailSettings}
                                  history={this.props.history}
                                  onChange={this.props.updateDetailState}
                                  onFetch={this.props.fetchRecordDetail}
                                  onSubmit={this.props.postRecordDetail} />;
        }
    }
}


const mapStateToProps = state => {
    return {
        listing: getListingState('person', state),
        detail: getDetailState('person', state),
        detailErrors: getDetailSubmitErrors('person', state),
        detailSettings: getDetailSettings('person', state),
    };
}

const mapDispatchToProps = dispatch => {
    return {
        updateListingState: (state) => {dispatch(updateListingState('person', state))},
        fetchRecordListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('person', query, filters, offset, limit))},
        updateDetailState: (state) => {dispatch(updateDetailState('person', state))},
        fetchRecordDetail: (id) => {dispatch(fetchRecordDetail('person', id))},
        postRecordDetail: (id, data) => {dispatch(postRecordDetail('person', id, data))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PersonRecord));
