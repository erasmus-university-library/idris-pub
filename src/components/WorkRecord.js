import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import WorkListing from './WorkListing';
import WorkDetail from './WorkDetail';

import { getListingState, getDetailState, getDetailSettings, getDetailSubmitErrors } from '../selectors';
import { updateListingState, fetchRecordListing,
         updateDetailState, fetchRecordDetail, postRecordDetail,
         changeAppHeader } from '../actions';


class WorkRecord extends Component {


    render() {
        const { match, listing, detail, detailErrors } = this.props;
        if (match.params.id === undefined){
            return <WorkListing {...listing}
                                history={this.props.history}
                                settings={this.props.detailSettings}
                                changeAppHeader={this.props.changeAppHeader}
                                onChange={this.props.updateListingState}
                                onFetch={this.props.fetchRecordListing} />;
        } else {
            return <WorkDetail {...detail}
                                initialValues={detail.record}
                                changeAppHeader={this.props.changeAppHeader}
                                enableReinitialize={true}
                                submittedErrors={detailErrors}
                                id={match.params.id}
                                settings={this.props.detailSettings}
                                history={this.props.history}
                                onChange={this.props.updateWorkState}
                                onFetch={this.props.fetchWorkRecord}
                                onSubmit={this.props.postWorkRecord}
            />;
        }
    }
}


const mapStateToProps = state => {
    return {
        listing: getListingState('work', state),
        detail: getDetailState('work', state),
        detailErrors: getDetailSubmitErrors('work', state),
        detailSettings: getDetailSettings('work', state),
    };
}

const mapDispatchToProps = dispatch => {
    return {
        changeAppHeader: (title) => {dispatch(changeAppHeader(title))},
        updateListingState: (state) => {dispatch(updateListingState('work', state))},
        fetchRecordListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('work', query, filters, offset, limit))},
        updateWorkState: (state) => {dispatch(updateDetailState('work', state))},
        fetchWorkRecord: (id) => {dispatch(fetchRecordDetail('work', id))},
        postWorkRecord: (id, data) => {dispatch(postRecordDetail('work', id, data))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(WorkRecord));
