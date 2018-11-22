import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CourseGroupListing from './CourseGroupListing';
import CourseListing from './CourseListing';

import { getNavigation } from '../selectors';
import { courseNavigation } from '../actions';

class CourseRecord extends Component {

  componentDidMount(){
    if (this.props.navigation.length == 0 && !this.props.embed){
      this.props.loadCourseNavigation();
    }
  }
  render() {
    const { match } = this.props;
    if (match.path === '/group/:group_id' || match.path === '/group/:group_id/add') {
      return (
	<CourseGroupListing id={match.params.group_id}
			    openAddDialog={match.path === '/group/:group_id/add'}
			    history={this.props.history}
			    navigation={this.props.navigation} />)
    } else if (match.path === '/group/:group_id/course/:course_id' ||
	       match.path === '/group/:group_id/course/:course_id/add') {
      return (
	<CourseListing id={match.params.course_id}
		       openAddDialog={match.path === '/group/:group_id/course/:course_id/add'}
		       history={this.props.history}
		       groupId={match.params.group_id}/>)
    } else {
      return null
    }
  }
}


const mapStateToProps = state => {
    return {
      navigation: getNavigation(state),
    };
}

const mapDispatchToProps = dispatch => {
    return {
      loadCourseNavigation: () => {dispatch(courseNavigation())},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CourseRecord));
