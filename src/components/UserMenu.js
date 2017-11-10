import React, { Component } from 'react';
import Button from 'material-ui/Button';

class UserMenu extends Component {

  render() {
      if (this.props.user){
          return (
              <Button color="contrast"
                      aria-label="logout"
                      onClick={this.props.onLogout}>Logout</Button>);
      } else {
          return (
              <Button color="contrast"
                      aria-label="login"
                      onClick={this.props.onLogin}>Login</Button>);
      }
  }
}

export default UserMenu;
