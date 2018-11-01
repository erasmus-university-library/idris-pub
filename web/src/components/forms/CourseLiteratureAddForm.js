import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

import styles from './formStyles';
import FileUploadField from '../widgets/FileUpload';

@withStyles(styles)
class CourseLiteratureAddForm extends Component {

  state = {
    activeStep: 0,
    title: '',
    authors: '',
    year: '',
    startPage: '',
    endPage: '',
    totalPages: '',
    bookTitle: '',
    journal: '',
    volume: '',
    issue: '',
    doi: '',
    link: '',
    pdf: '',
    type: 'article'
  }

  handleChange = (name) => (event) => {
    this.setState({[name]: event.target.value});
  }

  handleSubmitAddLiterature = (event) => {
    this.setState({activeStep: 1});
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
    const { activeStep } = this.state;

    return (
      <Dialog open={this.props.open !== false}
	      onClose={this.handleClose}>
        <DialogTitle>
	  New Course Literature
	</DialogTitle>
        <DialogContent style={{minWidth: 550}}>
	  <Stepper activeStep={this.state.activeStep}
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
		      label="Article DOI"
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
		      onChange={this.handleChange('startPage')}
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
		      id="startPage"
		      label="Start Page"
		      value={this.state.startPage}
		      className={classes.guttered}
		      onChange={this.handleChange('startPage')}
		      margin="dense"
			/>
		    : null }
		    {this.state.type === 'article'  || this.state.type === 'bookChapter' ?
		    <TextField
		      id="ending"
		      label="End Page"
		      value={this.state.endPage}
		      className={this.state.type === 'bookChapter' ? classes.guttered :classes.gutteredRightField}
		      onChange={this.handleChange('endPage')}
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
	      </StepContent>
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
