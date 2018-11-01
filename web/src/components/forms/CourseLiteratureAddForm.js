import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import styles from './formStyles';
import FileUploadField from '../widgets/FileUpload';

import IdrisSDK from '../../sdk.js';
const sdk = new IdrisSDK();

@withStyles(styles)
class CourseLiteratureAddForm extends Component {

  state = {
    activeStep: 0,
    processing: false,
    title: '',
    authors: '',
    year: '',
    start_page: '',
    end_page: '',
    totalPages: '',
    bookTitle: '',
    journal: '',
    volume: '',
    issue: '',
    doi: '',
    link: '',
    pdf: '',
    type: 'article',
    error: null
  }

  handleChange = (name) => (event) => {
    this.setState({[name]: event.target.value});
  }

  handleSubmitAddLiterature = (event) => {
    if (this.state.doi){
      if (this.state.doi.indexOf('10.') == -1){
	this.setState({error: 'doi'});
      } else {
	const doi = this.state.doi.substr(this.state.doi.indexOf('10.'));
	this.setState({activeStep: 1,
		       doi,
		       error: null,
		       processing: true});
	sdk.courseDOILookup(doi).then(
	  response => response.json(),
	  error => {console.log('DOI Lookup Error: ' + error)})
	  .then(data => {
	    this.setState({...data.course,
			   processing: false});
      });
      }

    } else {
      this.setState({activeStep: 1,
		     processing: false});
    }
  }

  handleSubmitDescribeLiterature = (event) => {
    this.setState({activeStep: 2});
  }

  handleSubmitBack = (event) => {
    this.setState({activeStep: this.state.activeStep - 1});
  }

  handleClose = () => {
    this.props.onClose();
  }

  render() {
    const { classes } = this.props;
    const { activeStep, processing } = this.state;

    return (
      <Dialog open={this.props.open !== false}
	      onClose={this.handleClose}>
        <DialogTitle>
	  New Course Literature
	</DialogTitle>
        <DialogContent style={{minWidth: 550}}>
	  <Stepper activeStep={activeStep}
		   orientation="vertical"
		   className={classes.FullStepper}>
	    <Step key={0}>
	      <StepLabel>
		<Tooltip title="Provide an article DOI, a website link or a PDF file of the literature you want to add."
			 placement="right">
		  <span>Add Literature</span>
		</Tooltip>
	      </StepLabel>
	      <StepContent>
		<form className={classes.formItem} noValidate autoComplete="off">
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="doi"
		      label={this.state.error === 'doi' ? 'Invalid DOI': "Article DOI"}
		      error={this.state.error === 'doi'}
		      value={this.state.doi}
		      className={classes.flex}
		      disabled={this.state.link !== '' ? true : false}
		      onChange={this.handleChange('doi')}
		      margin="dense"
		      />
		  </div>
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="link"
		      label="Website Link"
		      value={this.state.link}
		      disabled={this.state.doi !== '' ? true : false}
		      className={classes.flex}
		      onChange={this.handleChange('link')}
		      margin="dense"
		      />
		  </div>
		  <div className={classes.formFieldRow}>
		    <FileUploadField value={this.state.pdf} name='PDF File Upload'/>
		  </div>
		  <DialogActions style={{marginTop:'24px'}}>
		  <Button onClick={this.handleSubmitAddLiterature}
			  color="primary"
			  variant="contained"
			  disabled={!(Boolean(this.state.doi) ||
				      Boolean(this.state.link) ||
			  Boolean(this.state.pdf))}>
		    Next
		  </Button>
		  </DialogActions>
		</form>
	      </StepContent>
	    </Step>
	    <Step key={1}>
	      <StepLabel>
		<Tooltip title="Provide information about the literature to form a correct citation"
			 placement="right">
		  <span>Describe Literature</span>
		</Tooltip>
	      </StepLabel>
	      { processing ? <StepContent className={classes.processing}><CircularProgress size={50} /></StepContent> :
	      <StepContent>
		<form className={classes.formItem}
		      noValidate autoComplete="off"
		      style={{minHeight: 340}}>
		  <div className={classes.formFieldRow}>
		    <RadioGroup
		      name="type"
		      style={{flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between'}}
		      value={this.state.type}
		      onChange={this.handleChange('type')}
		      >
		      <FormControlLabel value="article" control={<Radio  color="primary"/>} label="Article" />
		      <FormControlLabel value="bookChapter" control={<Radio  color="primary"/>} label="Book Chapter" />
		      <FormControlLabel value="report" control={<Radio  color="primary"/>} label="Report" />
		      <FormControlLabel value="annotation" control={<Radio  color="primary"/>} label="Annotation" />
		    </RadioGroup>

		  </div>
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="title"
		      label={this.state.type === 'bookChapter' ? 'Chapter Title': 'Title'}
		      value={this.state.title}
		      className={classes.flex}
		      onChange={this.handleChange('title')}
		      margin="dense"
		      />
		  </div>
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="authors"
		      label="Authors"
		      value={this.state.authors}
		      className={classes.flex}
		      onChange={this.handleChange('authors')}
		      margin="dense"
		      />
		  </div>
		  {this.state.type === 'article' ?
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="journal"
		      label="Journal"
		      value={this.state.journal}
		      className={classes.flex}
		      onChange={this.handleChange('journal')}
		      margin="dense"
		      />
		    </div>
		  : null}
		  {this.state.type === 'bookChapter' ?
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="bookTitle"
		      label="Book Title"
		      value={this.state.bookTitle}
		      className={classes.flex}
		      onChange={this.handleChange('bookTitle')}
		      margin="dense"
		      />
		    </div>
		  : null}
		  <div className={classes.formFieldRow}>
		    {this.state.type !== 'report' ?
		    <TextField
		      id="year"
		      label="Year"
		      value={this.state.year}
		      className={classes.gutteredLeftField}
		      onChange={this.handleChange('start_page')}
		      margin="dense"
			/>
		    : null }
		  {this.state.type === 'article' ?
		    <TextField
		      id="volume"
		      label="Volume"
		      value={this.state.volume}
		      className={classes.guttered}
		      onChange={this.handleChange('volume')}
		      margin="dense"
			/>
		    : null }
		  {this.state.type === 'article' ?
		    <TextField
		      id="issue"
		      label="Issue"
		      value={this.state.issue}
		      className={classes.guttered}
		      onChange={this.handleChange('issue')}
		      margin="dense"
			/>
		    : null }
		    {this.state.type === 'article'  || this.state.type === 'bookChapter' ?
		    <TextField
		      id="start_page"
		      label="Start Page"
		      value={this.state.start_page}
		      className={classes.guttered}
		      onChange={this.handleChange('start_page')}
		      margin="dense"
			/>
		    : null }
		    {this.state.type === 'article'  || this.state.type === 'bookChapter' ?
		    <TextField
		      id="ending"
		      label="End Page"
		      value={this.state.end_page}
		      className={this.state.type === 'bookChapter' ? classes.guttered :classes.gutteredRightField}
		      onChange={this.handleChange('end_page')}
		      margin="dense"
			/>
		    : null }
		  {this.state.type === 'bookChapter' ?
		    <TextField
		      id="totalPages"
		      label="Total Pages in Book"
		      value={this.state.totalPages}
		      className={classes.gutteredRightField}
		      onChange={this.handleChange('totalPages')}
			margin="dense"
			style={{minWidth:'200px'}}
			/>
		    : null }
		  {this.state.type === 'annotation' ?
		    <TextField
		      id="caseName"
		      label="Case Name"
		      value={this.state.caseName}
		      className={classes.gutteredRightField}
		      onChange={this.handleChange('caseName')}
			style={{flex: 1}}
		      margin="dense"
			/>
		    : null }
		  </div>
		  <DialogActions style={{marginTop:'24px'}}>
		  <Button onClick={this.handleSubmitBack} color="primary">
		    Back
		  </Button>
		  <Button onClick={this.handleSubmitDescribeLiterature}
			  color="primary"
			  variant="contained"
			  disabled={!(Boolean(this.state.title) &&
			  Boolean(this.state.authors))}>
		    Next
		  </Button>
		  </DialogActions>
		</form>
	      </StepContent>}
	    </Step>
	    <Step key={2}>
	      <StepLabel>Confirm Literature</StepLabel>
	      <StepContent>
		<Card style={{backgroundColor: '#eeeeee'}}>
		  <CardContent>
		  <Typography variant="h5" color="textSecondary" gutterBottom>
		    Adding Literature to Course
		  </Typography>
		  <Typography component="p">
		    Literature bears no additional costs.
		  </Typography>
		  </CardContent>
		  <CardActions>
		    <Button size="small">Learn More</Button>
		  </CardActions>
		</Card>
		<DialogActions style={{marginTop:'24px'}}>
		  <Button onClick={this.handleSubmitBack} color="primary">
		    Back
		  </Button>
		  <Button onClick={this.handleSubmitConfirmLiterature}
			  color="primary"
			  variant="contained">
		    Finish
		  </Button>
		</DialogActions>
	      </StepContent>
	    </Step>
	  </Stepper>
        </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
          </DialogActions>
       </Dialog>
    );
  }
}

export default CourseLiteratureAddForm;
