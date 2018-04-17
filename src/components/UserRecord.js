import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import UserListing from './UserListing';
import UserDetail from './UserDetail';

import { getListingState, getDetailState, getDetailSettings, getDetailSubmitErrors } from '../selectors';
import { updateListingState, fetchRecordListing,
         updateDetailState, fetchRecordDetail, postRecordDetail,
         changeAppHeader } from '../actions';


class UserRecord extends Component {


    render() {
        const { match, listing, detail, detailErrors } = this.props;
        if (match.params.id === undefined){
            return <UserListing {...listing}
                                  settings={this.props.detailSettings}
                                  history={this.props.history}
                                  changeAppHeader={this.props.changeAppHeader}
                                  onChange={this.props.updateListingState}
                                  onFetch={this.props.fetchRecordListing} />;
        } else {
            return <UserDetail {...detail}
                                  initialValues={detail.record}
                                  enableReinitialize={true}
                                  submittedErrors={detailErrors}
                                  changeAppHeader={this.props.changeAppHeader}
                                  id={match.params.id}
                                  settings={this.props.detailSettings}
                                  history={this.props.history}
                                  onDetailChange={this.props.updateDetailState}
                                  onFetch={this.props.fetchRecordDetail}
                                  onSubmit={this.props.postRecordDetail} />;
        }
    }
}


const mapStateToProps = state => {
    return {
        listing: getListingState('user', state),
        detail: getDetailState('user', state),
        detailErrors: getDetailSubmitErrors('user', state),
        detailSettings: getDetailSettings('user', state),
    };
}

const mapDispatchToProps = dispatch => {
    return {
        changeAppHeader: (title) => {dispatch(changeAppHeader(title))},
        updateListingState: (state) => {dispatch(updateListingState('user', state))},
        fetchRecordListing: (query, filters, offset, limit) => {dispatch(
            fetchRecordListing('user', query, filters, offset, limit))},
        updateDetailState: (state) => {dispatch(updateDetailState('user', state))},
        fetchRecordDetail: (id) => {dispatch(fetchRecordDetail('user', id))},
        postRecordDetail: (id, data) => {dispatch(postRecordDetail('user', id, data))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UserRecord));
