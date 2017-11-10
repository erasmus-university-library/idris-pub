import React, { Component } from 'react';
import { connect } from 'react-redux'
import { fetchToken, invalidateToken,
         loginFormOpen, loginFormClose, loginFormChange,
         sideBarOpen, sideBarClose,
         selectRecordType,
         initializeApp,
         fetchRecordList } from '../actions'
import Layout from '../components/Layout.js'

class App extends Component {
  componentDidMount() {
      this.props.action.initializeApp();
  }
  render() {
      return <Layout {...this.props} />
  }
}

const mapStateToProps = state => {
  return {authenticatedUserId: state.app.auth.user,
          title: state.app.title,
          loginForm: {open: state.app.loginForm.open,
                      user: state.app.loginForm.user,
                      password: state.app.loginForm.password,
                      error: state.app.loginForm.error},
          sideBar: {open: state.app.sideBar.open,
                    types: state.app.config.types},
          recordList: {total: state.app.recordList.total,
                       records: state.app.recordList.records,
                       offset: state.app.recordList.offset,
                       query: state.app.recordList.query,
                       type: state.app.recordList.type,
                       label: state.app.recordList.label,
                       label_plural: state.app.recordList.label_plural,
                       page: state.app.recordList.page,
                       limit: state.app.recordList.limit}
      };
}

const mapDispatchToProps = dispatch => {
    return {
        action: {
            initializeApp: () => {dispatch(initializeApp())},
            loginForm: {onOpen: () => {dispatch(loginFormOpen())},
                        onClose: () => {dispatch(loginFormClose())},
                        onChange: (user, password) => {dispatch(loginFormChange(user, password))},
                        onLogin: (user, password) => {dispatch(fetchToken(user, password))},
                        onLogout: () => {dispatch(invalidateToken())},
            },
            sideBar: {onOpen: () => {dispatch(sideBarOpen())},
                      onClose: () => {dispatch(sideBarClose())},
                      onTypeClicked: (type, label) => {dispatch(selectRecordType(type))},
            },
            recordList: {
                handleFetch: (type, query, offset, limit, timeout) => {dispatch(
                    fetchRecordList(type, query, offset, limit, timeout))}},
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
