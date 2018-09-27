import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CourseGroupListing from './CourseGroupListing';

import { getNavigation } from '../selectors';
import { courseNavigation } from '../actions';

class CourseRecord extends Component {

  componentDidMount(){
    if (this.props.navigation.length == 0){
      this.props.loadCourseNavigation();
    }
  }
  render() {
    const { match } = this.props;
    if (match.path === '/group/:id'){
      return (
	<CourseGroupListing id={match.params.id} navigation={this.props.navigation} />)
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
