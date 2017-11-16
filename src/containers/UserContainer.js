import React, { Component } from 'react';
import { connect } from 'react-redux';

import UserMenu from '../components/UserMenu';
import LoginForm from '../components/LoginForm';

import { loginUser } from '../actions/SettingsActions';
import { logoutUser } from '../actions/GlobalActions';
import { updateLoginForm } from '../actions/UIActions';
import { getAuthenticatedUserId } from '../selectors/SettingsSelectors';
import { getLoginFormState } from '../selectors/GlobalSelectors';

class UserContainer extends Component {
  componentDidMount() {
  }
  render() {
      return (<div>
        <UserMenu authenticatedUser={this.props.authenticatedUser}
                  onLogout={this.props.onLogout}
                  onShowLoginForm={this.props.onShowLoginForm}/>
        <LoginForm open={this.props.loginForm.open}
                   user={this.props.loginForm.user}
                   error={this.props.loginForm.error}
                   password={this.props.loginForm.password}
                   onLogin={this.props.onLogin}
                   onClose={this.props.onHideLoginForm}
                   onChange={this.props.onUpdateLoginForm} />
      </div>);


  }
}
const mapStateToProps = state => {
    return {authenticatedUser: getAuthenticatedUserId(state),
            loginForm: getLoginFormState(state)};
}

const mapDispatchToProps = dispatch => {
    return {
        onShowLoginForm: () => {dispatch(updateLoginForm({open:true}))},
        onHideLoginForm: () => {dispatch(updateLoginForm({open:false}))},
        onUpdateLoginForm: (fields) => {dispatch(updateLoginForm(fields))},
        onLogin: (user, password) => {dispatch(loginUser(user, password))},
        onLogout: () => {dispatch(logoutUser())},
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(UserContainer);
