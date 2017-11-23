import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchAppConfig } from '../actions/SettingsActions';
import { changeAppTitle, updateUI, flashMessage } from '../actions/UIActions';
import { updateRecordDetail } from '../actions/RecordActions';
import { getAppTitle,
         getFlashMessage,
         getSideBarOpen } from '../selectors/UISelectors';
import { getAuthenticatedUserId,
         getSettingsError } from '../selectors/SettingsSelectors';
import { getIsFetching,
         getDetailOpen } from '../selectors/GlobalSelectors';

import Layout from '../components/LayoutComponent';
import AlertDialog from '../components/AlertDialog';

class AppContainer extends Component {
  componentDidMount() {
      this.props.initializeApp();
      this.props.changeAppTitle('EUR Affiliations');
  }

  render() {
      let error = null;
      let progress = null;
      if (this.props.settingsError !== null){
          error = <AlertDialog title={'error'} message={'Error fetching settings from backend..'} />
      }
      return (<div>
          {error}
          {progress}
          <Layout {...this.props} />
          </div>)
  }
}
const mapStateToProps = state => {
    return {
        title: getAppTitle(state),
        settingsError: getSettingsError(state),
        showProgress: getIsFetching(state),
        userLoggedIn: getAuthenticatedUserId(state) !== null,
        isSideBarOpen: getSideBarOpen(state),
        isDetailOpen:  getDetailOpen(state),
        flash: getFlashMessage(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
        initializeApp: () => {dispatch(fetchAppConfig())},
        changeAppTitle: (title) => {dispatch(changeAppTitle(title))},
        openSideBar: () => {dispatch(updateUI({sideBarOpen: true}))},
        closeSideBar: () => {dispatch(updateUI({sideBarOpen: false}))},
        closeDetailBar: () => {dispatch(updateRecordDetail({id: null, type:null}))},
        changeFlashMessage: (message) => {dispatch(flashMessage(message))}
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
