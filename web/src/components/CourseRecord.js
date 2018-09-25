import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CourseGroupListing from './CourseGroupListing';

import { getListingState, getDetailState, getDetailSettings, getNavigation, getDetailSubmitErrors } from '../selectors';
import { updateListingState, fetchRecordListing,
         updateDetailState, fetchRecordDetail, postRecordDetail, courseNavigation,
         changeAppHeader, deleteRecordDetail } from '../actions';
import { arrayRemoveAll, arrayPush, getFormValues, change } from 'redux-form';

class CourseRecord extends Component {

  componentDidMount(){
    if (this.props.navigation.length == 0){
      this.props.loadCourseNavigation();
    }
  }
    render() {
      const { match, listing, detail, detailErrors } = this.props;
        if (match.path === '/group/:id'){
          return <CourseGroupListing {...listing}
                                id={match.params.id}
                                history={this.props.history}
                                settings={this.props.detailSettings}
	                        navigation={this.props.navigation}
                                onChange={this.props.updateListingState}
                                onFetch={this.props.fetchRecordListing} />;
        } else {
            return null
        }
    }
}


const mapStateToProps = state => {
    return {
        listing: getListingState('course', state),
        navigation: getNavigation(state),
         detail: getDetailState('course', state),
        detailErrors: getDetailSubmitErrors('course', state),
        detailSettings: getDetailSettings('course', state),
        formValues: getFormValues('course')(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
      loadCourseNavigation: () => {dispatch(courseNavigation())},
      updateListingState: (state) => {dispatch(updateListingState('course', state))},
      fetchRecordListing: (query, filters, offset, limit) => {dispatch(
        fetchRecordListing('course', query, filters, offset, limit))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CourseRecord));
