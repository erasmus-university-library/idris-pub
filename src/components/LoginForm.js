import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
});

@withStyles(styles)
class LoginForm extends Component {


  handleChange = (name) => (event) => {
      this.props.onChange({[name]: event.target.value, error:null});
  }

  handleSubmit = (event) => {
      this.props.onLogin(this.props.user, this.props.password);
  }

  render() {
    const { classes } = this.props;
    if (this.props.open === false){
        return <Button color="contrast" onClick={() => this.props.onChange({open: true})}>Login</Button>;

    }
    return (
        <Dialog open={this.props.open !== false} onClose={() => this.props.onChange({open: false})}>
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
            <Button onClick={() => this.props.onChange({open: false})} color="primary">
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
