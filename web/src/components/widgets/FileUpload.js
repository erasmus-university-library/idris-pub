import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

import Dropzone from 'react-dropzone';
import prettyBytes from 'pretty-bytes';

import IdrisSDK from '../../sdk.js';
const sdk = new IdrisSDK();

const styles = theme => ({
  uploadCard: {
    display: 'flex',
    width: 500,
    height: 150,
    backgroundColor: '#F0F0F0',
    border: 'dashed',
    borderColor: '#C8C8C8',
    cursor: 'pointer',
    alignItems: 'center'
  },
  fileCard: {
    display: 'flex',
    width: 500,
    height: 150,
  },
  uploadButton: {
    textAlign: 'center',
    width: '100%'
  },
  downloadIcon: {
    marginLeft: theme.spacing.unit,
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

  state = {
    is_accepted: false,
    is_initialized: false,
    is_uploaded: false,
    is_finalized: false,
    blobId: null,
    uploadURL: null,
    file: null,
    progress: 0,
    blob: {}
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    const file = acceptedFiles[0];
    this.setState({file: file, is_accepted: true});
    sdk.recordSubmit(
      'blob',
      null,
      {name: file.name, bytes: file.size, format: file.type}
    ).then(response => response.json(),
	   error => {console.log('FileUploadField Error: ' + error)}
	  ).then(data => {
	    this.setState({is_initialized: true,
			   blobId: data.id,
			   uploadURL: data.upload_url})
	    sdk.blobUpload(data.upload_url, this.state.file, this.onProgress).then(
	      response => {
		this.setState({is_uploaded: true})
		sdk.recordSubmit('blob', this.state.blobId, null).then(
		  response => response.json(),
		  error => {console.log('FileUploadField Error: ' + error)}
		).then(data => {
		  this.setState({is_finalized: true,
				 blob: data});
		  this.props.onUpload(data);
		  })

		},
	      error => {console.log('FileUploadField Error: ' + error);})
	  });
  }

  onDownload = () => {
    console.log('downloading', this.props.value, this.props.name);
    sdk.blobDownload(this.props.value, this.props.name);
  }

  onProgress = (progress) => {
    this.setState({progress: (progress.loaded / this.state.file.size) * 100});
  }

  render(){
    const {classes, value} = this.props;
    const {blob, progress,
	   is_finalized, is_uploaded, is_initialized, is_accepted} = this.state;
    if (value && is_finalized === false) {
      return (<div>
	      <Button variant="contained" onClick={this.onDownload}>
	      Download File
	      <CloudDownloadIcon className={classes.downloadIcon} />
	      </Button>
	      </div>)
    }

    return (
      <div>
	<InputLabel className={classes.uploadLabel}>File Upload</InputLabel>
	{is_accepted === false ?
	<Dropzone onDrop={this.onDrop} style={{}} multiple={false}>
	  <div className={classes.uploadCard}>
	  <div className={classes.uploadButton}>
		<Typography variant="button">
		  Drag and drop a file here or click
		</Typography>
		<br/>
		<CloudUploadIcon className={classes.uploadIcon} />
	      </div>
	    </div>
	  </Dropzone>:
	  <Card className={classes.fileCard}>
	      {blob.thumbnail === undefined ? null :
		<CardMedia image={`data:image/jpeg;base64,${blob.thumbnail}`} style={{width:'100%'}}/>
		}
	      <CardContent className={classes.uploadButton}>
		  {is_finalized === true ?
		    <div>
			<Typography variant="headline">{blob.name}</Typography>
			  <Typography variant="subheading">
			      {prettyBytes(blob.bytes)}
				{blob.info.pages !== undefined ? ` / ${blob.info.pages} pages` : ''}
				{blob.info.words !== undefined ? ` / ${blob.info.words} words` : ''}
			    </Typography>
		      </div> :
		      <div>
			  <Typography variant="button">
			      {is_initialized === false ? 'Starting Upload' :
				is_uploaded === false ? 'Uploading' :
				is_finalized === false ? 'Finishing Upload': 'Finished'}
			    </Typography>
			    <br/>
			      <CircularProgress
				  variant={progress === 0? 'indeterminate' : 'determinate'}
				  value={progress}/>
			</div>
			}
		</CardContent>
	  </Card>}
      </div>);
  }
}
export default withStyles(styles, { withTheme: true })(FileUploadField);
