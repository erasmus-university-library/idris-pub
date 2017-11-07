import React, { Component } from 'react';
import Button from 'material-ui/Button';

class UserMenu extends Component {

  render() {
    return (
        <Button color="contrast"
                aria-label="login"
                onClick={this.props.onLoginClick}>
          Login
        </Button>
    );
  }
}

export default UserMenu;
