import React, { Component } from 'react';
import {connect} from 'react-redux';
import ui from 'redux-ui';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

import styles from './LoginFormStyles.js'

@ui({state: {loginFormUser: '', loginFormPassword: ''}})
@withStyles(styles)
@connect()
class LoginForm extends Component {


  handleChange = (name) => (event) => {
      this.props.onChange(name, event.target.value);
  }

  handleSubmit = (event) => {
      this.props.onLogin(this.props.user, this.props.password);
  }

  render() {
    const { classes } = this.props;
    return (
        <Dialog open={this.props.open} onRequestClose={this.props.onClose}>
          <DialogTitle>Login</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please enter your username and password here.
            </DialogContentText>
            <form className={classes.container} noValidate autoComplete="off">
            <TextField
              error={Boolean(this.props.error)}
              id="user"
              label="Username"
              className={classes.textField}
              value={this.props.user}
              onChange={this.handleChange('user')}
              margin="dense"
            />
            <TextField
              error={Boolean(this.props.error)}
              id="password"
              label="Password"
              className={classes.textField}
              type="password"
              autoComplete="current-password"
              value={this.props.password}
              onChange={this.handleChange('password')}
              margin="dense"
            />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.onClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleSubmit} color="primary"
                    disabled={!(Boolean(this.props.user) && Boolean(this.props.password))}>
              Login
            </Button>
          </DialogActions>
       </Dialog>
    );
  }
}

export default LoginForm;
