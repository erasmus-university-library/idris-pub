import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
const styles = theme => ({
  uploadCard: {
    display: 'flex',
    width: 300,
    height: 125,
    backgroundColor: '#F0F0F0',
    border: 'dashed',
    borderColor: '#C8C8C8',
    cursor: 'pointer',
    alignItems: 'center'
  },
  uploadButton: {
    textAlign: 'center',
    width: '100%'
  },
  uploadIcon: {
    width: 51,
    height: 51,
    color: '#909090'
  },
  uploadLabel: {
    fontSize: '12px'
  }
});

class FileUploadField extends React.Component {
  render(){
    const {classes} = this.props;
    return (
      <div>
	<InputLabel className={classes.uploadLabel}>File Upload</InputLabel>
	<div>
	  <div className={classes.uploadCard}>
	  <div className={classes.uploadButton}>
		<Typography variant="button">
		  Drag and drop a file here or click
		</Typography>
		<br/>
		<CloudUploadIcon className={classes.uploadIcon} />
	      </div>
	    </div>
	</div>
      </div>);
  }
}
export default withStyles(styles, { withTheme: true })(FileUploadField);
