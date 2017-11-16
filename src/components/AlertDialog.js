import React from 'react';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';

class AlertDialog extends React.Component {
  state = {
    open: true,
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  render() {
    return (
      <div>
        <Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
          <DialogTitle>{this.props.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.props.message}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleRequestClose} color="primary" autoFocus>
              {this.props.buttonText || 'Ok'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default AlertDialog;