import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CheckBox from '@material-ui/core/Checkbox';
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
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';

import styles from './formStyles';
import FileUploadField from '../widgets/FileUpload';
import Citation from '../widgets/Citation';
import { CourseLiteratureRoyaltyAvatar } from '../CourseLiteratureItem';

import IdrisSDK from '../../sdk.js';
const sdk = new IdrisSDK();

@withStyles(styles)
class CourseLiteratureForm extends Component {

  state = {
    activeStep: 0,
    processing: false,
    material: {title: '',
	       authors: '',
	       year: '',
	       starting: '',
	       ending: '',
	       book_pages: '',
	       book_title: '',
	       words: '',
	       pages: '',
	       journal: '',
	       volume: '',
	       issue: '',
	       doi: '',
	       link: '',
	       blob_id: '',
	       type: '',
	       exception: '',
	       confirmed: '',
	       id: '',
	      },
    editing: false,
    doi_error: null,
    link_error: null,
    starting_error: null,
    ending_error: null,
    metadata_error: null,
    book_pages_error: null,
    citation: {},
    royalties: {},
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.material && (prevProps.material||{}).id !== this.props.material.id){
      let material = {
	id: this.props.material.id,
	title: this.props.material.title||'',
	authors: this.props.material.author?this.props.material.author[0].literal:'',
	year: this.props.material.issued?this.props.material.issued['date-parts'][0][0]:'',
	starting: this.props.material.page?this.props.material.page.split('-')[0]:'',
	ending: this.props.material.page?this.props.material.page.split('-')[1]:'',
	book_pages: this.props.material.total||'',
	book_title: this.props.material['container-title'] || '',
	journal: this.props.material['container-title'] || '',
	volume: this.props.material.volume||'',
	issue: this.props.material.issue||'',
	type: ({'article-journal': 'article',
	       'book-chapter': 'bookChapter',
	       'report': 'report',
		'annotation': 'annotation'}[this.props.material.type])||'',
      };

      material.title = this.props.material.title;

      this.setState({activeStep: 1,
		     editing: true,
		     processing: false,
		     material})
    }
  }



  handleChange = (name) => (event) => {
    let starting_error = this.state.starting_error;
    let ending_error = this.state.ending_error;
    let book_pages_error = this.state.book_pages_error;

    const material = this.state.material;
    if (event.target.type === 'checkbox'){
      material[name] = event.target.checked;
    } else if (name === 'exception' && event.target.value === 'other'){
      material[name] = '';
      material['custom_exception'] = true;
    } else if (name === 'book_title' && event.target.value === 'other'){
      material[name] = '';
      material['customBookTitle'] = true;
    } else if (name === 'starting'){
      if (isNaN(event.target.value)){
	starting_error = 'number only';
      } else {
	starting_error = null;
      }
      material[name] = event.target.value;
    } else if (name === 'ending'){
      if (isNaN(event.target.value)){
	ending_error = 'number only';
      } else {
	ending_error = null;
      }
      material[name] = event.target.value;
    } else if (name === 'book_pages'){
      if (isNaN(event.target.value)){
	book_pages_error = 'number only';
      } else {
	book_pages_error = null;
      }
      material[name] = event.target.value;
    } else {
      material[name] = event.target.value;
    }
    this.setState({material,
		   starting_error,
		   ending_error,
		   book_pages_error});
  }

  selectBookTitle = (event) => {
    const bookTitle = event.target.value;
    if (bookTitle === 'other'){
      return this.handleChange('book_title')(event);
    }
    const material = this.state.material;
    material.book_title = bookTitle;
    let selectedToc = null;
    Object.values(this.props.tocItems).forEach(toc => {
      if (toc.type === 'book-chapter' && toc['container-title'] === bookTitle){
	selectedToc = toc;
      }})
    if (selectedToc !== null){
      material.year = selectedToc.issued['date-parts'][0][0];
      material.authors = selectedToc.author.map(author => (author.literal)).join(', ');
      material.book_pages = selectedToc.total;

    }
    this.setState({material});
  }

  handleSubmitAddLiterature = (event) => {
    const material = this.state.material;
    let link_error = null;
    let doi_error = null;
    if (material.link &&
	material.link.substr(0, 4) !== 'http'){
      link_error = 'Invalid Link';
    }
    if (material.doi &&
	material.doi.indexOf('10.') == -1){
      doi_error = 'Invalid DOI';
    }

    if (material.doi && doi_error === null){
      const doi = material.doi.substr(
	material.doi.indexOf('10.'));
      material['doi'] = doi;
      this.setState({activeStep: 1,
		     material,
		     link_error,
		     doi_error,
		     processing: true});
      sdk.courseDOILookup(doi).then(
	  response => response.json(),
	  error => {console.log('DOI Lookup Error: ' + error)})
	  .then(data => {
	    this.setState({
	      material: Object.assign(this.state.material, data.course),
	      starting_error: (data.course.starting && isNaN(data.course.starting)? 'number only' : null),
	      ending_error: (data.course.ending && isNaN(data.course.ending)? 'number only' : null),
	      processing: false});
      });
    } else {
      this.setState({activeStep: link_error === null && doi_error === null ? 1: 0,
		     link_error,
		     doi_error,
		     processing: false});
    }
  }

  handleSubmitDescribeLiterature = (event) => {
    if (this.state.editing){
      console.log('edited', this.state.material);
      this.setState({processing: true});
      sdk.courseUpdateMaterial(this.props.courseId, this.state.material.id, this.state.material).then(
	response => response.json(),
	error => {console.log('Update Material Error: ' + error)})
	.then(data => {
	  this.handleClose(true);
	});
      return;
    }
    this.setState({activeStep: 2,
		   processing: true});
    sdk.courseAddMaterial(this.props.courseId, this.state.material, true).then(
      response => response.json(),
      error => {console.log('Add Material Error: ' + error)})
      .then(data => {
	this.setState({citation: data.csl,
		       royalties: data.royalties,
		       processing: false});
      });
  }

  handleSubmitConfirmLiterature = (event) => {
    this.setState({processing: true});
    sdk.courseAddMaterial(this.props.courseId, this.state.material).then(
      response => response.json(),
      error => {console.log('Add Material Error: ' + error)})
      .then(data => {
	this.handleClose(true);
      });

  }
  handleSubmitBack = (event) => {
    this.setState({activeStep: this.state.activeStep - 1});
  }

  handlePDFUpload = (blob) => {
    const material = this.state.material;
    material['blob_id'] = blob.id;
    material['words'] = blob.info.words;
    material['pages'] = blob.info.pages;
    if (blob.info.dois.length){
      material['doi'] = blob.info.dois[0];
    }
    this.setState({material: material});
  }

  handleClose = (updated) => {
    const material = this.state.material;
    for (var key in material){
      material[key] = '';
    }
    this.setState({material,
		   starting_error: null,
		   ending_error: null,
		   book_pages_error: null,
		   editing: false,
		   activeStep:0});
    this.props.onClose(updated);
  }

  render() {
    const { classes, tocItems, open, courseId } = this.props;
    const { activeStep, processing, editing,
	    link_error, doi_error, starting_error, ending_error, book_pages_error,
	    material, citation, royalties } = this.state;

    if (open !== true){
      return null;
    }

    let bookTitles = new Set();
    Object.values(tocItems).forEach(toc => (toc.type === 'book-chapter' ? bookTitles.add(toc['container-title']): null))
    bookTitles = Array.from(bookTitles);

    return (
      <Dialog open={open !== false}
	      onClose={this.handleClose}>
        <DialogTitle>
	  { editing === true ? 'Edit Course Literature' : 'New Course Literature'}
	</DialogTitle>
        <DialogContent style={{minWidth: 550}}>
	  <Stepper activeStep={activeStep}
		   orientation="vertical"
		   className={classes.FullStepper}>
	    <Step key={0} completed={editing}>
	      <StepLabel>
		<Tooltip title="Provide an article DOI, a website link or a PDF file of the literature you want to add."
			 placement="right">
		  <span>Add Literature</span>
		</Tooltip>
	      </StepLabel>
	      <StepContent>
		<div className={classes.MaterialAddStep}>
	      	<form className={classes.formItem} noValidate autoComplete="off">
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="doi"
		      label={Boolean(doi_error) ? doi_error: "Article DOI"}
		      error={Boolean(doi_error)}
		      value={material.doi}
		      className={classes.flex}
		      onChange={this.handleChange('doi')}
		      margin="dense"
		      />
		  </div>
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="link"
		      label={Boolean(link_error) ? link_error: "Website Link"}
		      error={Boolean(link_error)}
		      value={material.link}
		      className={classes.flex}
		      onChange={this.handleChange('link')}
		      margin="dense"
		      />
		  </div>
		  <div className={classes.formFieldRow}>
		    <FileUploadField value={material.blob_id}
				     onUpload={this.handlePDFUpload}
				     name='PDF File Upload'
				     message="Drag and drop a PDF file here or click"
				     accept='application/pdf'/>
		  </div>
		</form>
		</div>
	      </StepContent>
	    </Step>
	    <Step key={1}>
	      <StepLabel>
		<Tooltip title="Provide information about the literature to form a correct citation"
			 placement="right">
		  <span>Describe Literature</span>
		</Tooltip>
	      </StepLabel>
	      { processing ? <StepContent><div className={classes.processing}>
		  <CircularProgress size={50} />
		</div></StepContent> :
		<StepContent>
		    <div className={classes.MaterialAddStep}>
		<form className={classes.formItem}
		      noValidate autoComplete="off">
		  <div className={classes.formFieldRow}>
		    <RadioGroup
		      name="type"
		      style={{flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between'}}
		      value={material.type}
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
			label={material.type === 'bookChapter' ? 'Chapter Title': 'Title'}
			value={material.title}
			multiline
			rowsMax="3"
			className={classes.flex}
			onChange={this.handleChange('title')}
			margin="dense"
		      />
		  </div>
		  <div className={classes.formFieldRow}>
		    <TextField
			id="authors"
			label="Authors"
			multiline
			rowsMax="3"
			value={material.authors}
			className={classes.flex}
			onChange={this.handleChange('authors')}
			margin="dense"
		      />
		  </div>
		  {material.type === 'article' ?
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="journal"
		      label="Journal"
		      value={material.journal}
		      className={classes.flex}
		      onChange={this.handleChange('journal')}
		      margin="dense"
		      />
		    </div>
		  : null}
		    {material.type === 'bookChapter' && (bookTitles.length === 0 || Boolean(material.customBookTitle))?
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="book_title"
		      label="Book Title"
		      value={material.book_title}
		      className={classes.flex}
		      onChange={this.handleChange('book_title')}
		      margin="dense"
		      />
		    </div>
		  : null}
		    {material.type === 'bookChapter' &&
		     bookTitles.length > 0 &&
		     Boolean(material.customBookTitle) === false ?
		   <div className={classes.formFieldRow}>
		       <FormControl style={{width: '100%'}}>
			  <InputLabel htmlFor="book-title">Book Title</InputLabel>
			    <Select
				value={material.book_title}
				onChange={this.selectBookTitle}
				inputProps={{
				  name: 'book_title',
				  id: 'book-title',
				}}
				>
				{bookTitles.map(item => (
				  <MenuItem key={item} value={item}>{item}</MenuItem>))}
		     <Divider />
		     <MenuItem value="other">Other</MenuItem>
			      </Select>
			</FormControl>
		    </div>
		    : null}
		  <div className={classes.formFieldRow}>
		    <TextField
		      id="year"
		      label="Year"
		      value={material.year}
		      className={classes.gutteredLeftField}
		      onChange={this.handleChange('year')}
		      margin="dense"
			/>
		  {material.type === 'article' ?
		    <TextField
		      id="volume"
		      label="Volume"
		      value={material.volume}
		      className={classes.guttered}
		      onChange={this.handleChange('volume')}
		      margin="dense"
			/>
		    : null }
		  {material.type === 'article' ?
		    <TextField
		      id="issue"
		      label="Issue"
		      value={material.issue}
		      className={classes.guttered}
		      onChange={this.handleChange('issue')}
		      margin="dense"
			/>
		    : null }
		    {material.type === 'article'  || material.type === 'bookChapter' ?
		    <TextField
		      id="starting"
		      error={Boolean(starting_error)}
		      label={Boolean(starting_error) ? starting_error: "Start Page"}
		      value={material.starting}
		      className={classes.guttered}
		      onChange={this.handleChange('starting')}
		      margin="dense"
			/>
		    : null }
		    {material.type === 'article'  || material.type === 'bookChapter' ?
		    <TextField
		      id="ending"
		      error={Boolean(ending_error)}
		      label={Boolean(ending_error) ? ending_error: "End Page"}
		      value={material.ending}
		      className={material.type === 'bookChapter' ? classes.guttered :classes.gutteredRightField}
		      onChange={this.handleChange('ending')}
		      margin="dense"
			/>
		    : null }
		  {material.type === 'bookChapter' ?
		    <TextField
		      id="book_pages"
		      error={Boolean(book_pages_error)}
		      label={Boolean(book_pages_error) ? book_pages_error: "Total Pages in Book"}
		      value={material.book_pages}
		      className={classes.gutteredRightField}
		      onChange={this.handleChange('book_pages')}
			margin="dense"
			style={{minWidth:'200px'}}
			/>
		    : null }
		  {material.type === 'annotation' ?
		    <TextField
		      id="caseName"
		      label="Case Name"
		      value={material.caseName}
		      className={classes.gutteredRightField}
		      onChange={this.handleChange('caseName')}
			style={{flex: 1}}
		      margin="dense"
			/>
		    : null }
		  </div>
		  </form>
		  </div>
	      </StepContent>}
	    </Step>
	    <Step key={2}>
	      <StepLabel>Confirm Literature</StepLabel>
	      { processing ? <StepContent><div className={classes.processing}>
		  <CircularProgress size={50} />
		</div></StepContent> :
		<StepContent>
		    <div className={classes.MaterialAddStep}>
			<Typography variant="h5" color="textSecondary" gutterBottom>
			    The following literature will be added to the course:
			  </Typography>
			  <div style={{display: 'flex'}}>
			      <Citation citation={citation} />
				<div style={{marginLeft: 8}}>
				    <CourseLiteratureRoyaltyAvatar {...royalties} />
				  </div>
			    </div>
		{royalties.cost > 0 ?
		<Card style={{backgroundColor: '#eeeeee', marginTop:16}}>
		  <CardContent>
		  <Typography variant="h5" color="textSecondary" gutterBottom>
		    Royalty Costs
		  </Typography>
		   <Typography component="p">
		       To use this material in a course, an ammount of
		       <Tooltip title={royalties.cost_message}>
		       <strong>{` € ${(royalties.cost / 100).toFixed(2)} `}</strong>
		       </Tooltip>
			   has to be paid
			   <strong> per student </strong>
			     enrolled in the course.
		  </Typography>
		       <Typography component="p"  style={{marginBottom: 8, marginTop:8}}>
			   Possible Exceptions are:
			 </Typography>
			 {Boolean(material.custom_exception) === false ?
		    <RadioGroup
		      style={{flexDirection: 'row', flexGrow: 1, justifyContent: 'space-between'}}
		      value={material.exception}
		      onChange={this.handleChange('exception')}
		      >
			<FormControlLabel
			    value="openAccess"
			    control={<Radio  color="primary" style={{height:36}}/>}
			    label="The material is published in Open Access" />
			  <FormControlLabel
			      value="rightsOwner"
			      control={<Radio  color="primary" style={{height:36}}/>}
			      label="I am author of the work and full owner of the copyright." />
			    <FormControlLabel
				value="other"
				control={<Radio  color="primary" style={{height:36}}/>}
				label="Another reason" />
		       </RadioGroup>
			  :
		    <TextField
			  id="other_exception"
			  label="Another reason"
			  value={material.exception}
			  multiline
			  fullWidth
			  rowsMax="3"
			  onChange={this.handleChange('exception')}
			  margin="dense"
		      />
			 }
		       <Typography component="p" style={{marginBottom: 8, marginTop:8}}>
			   To continue,  please confirm:
			 </Typography>
		       <FormControlLabel control={
					   <CheckBox checked={Boolean(material.confirmed)}
						       onChange={this.handleChange('confirmed')}/>}
					     label="I declare that the information provided is true and correct to the best of my knowledge, and understand that adding this material can incur significant costs."/>
		  </CardContent>
		  <CardActions>
		    <Button size="small" href="https://www.stichting-pro.nl/nl/FAQ--Universiteiten" taerget="_blank">Learn More</Button>
		  </CardActions>
		       </Card> : null}
		  </div>
	      </StepContent>}
	    </Step>
	  </Stepper>
        </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
  	{!editing && (activeStep > 0) ?
 	      <Button onClick={this.handleSubmitBack} color="primary">
		  Back
		</Button>
	      : null}
      {!editing && (activeStep === 0) ?
		  <Button onClick={this.handleSubmitAddLiterature}
			  color="primary"
			  variant="contained"
			  disabled={!(Boolean(material.doi) ||
				      Boolean(material.link) ||
			  Boolean(material.blob_id))}>
		    Next
		  </Button>
	      : null}
	    {activeStep === 1 ?
		<Button onClick={this.handleSubmitDescribeLiterature}
			  color="primary"
			  variant="contained"
			  disabled={!(Boolean(material.title) &&
				      Boolean(material.authors) &&
				      Boolean(material.year) &&
				      (material.type === 'article' ? (
					Boolean(material.starting)  &&
					  Boolean(material.ending)  &&
					  starting_error === null &&
					  ending_error === null
				      ): true) &&
				      (material.type === 'bookChapter' ? (
					Boolean(material.book_title) &&
					  Boolean(material.book_pages) &&
					  Boolean(material.starting)  &&
					  Boolean(material.ending)  &&
					  starting_error === null &&
					  ending_error === null &&
					  book_pages_error === null
				      ): true))}>
	     {editing ? 'Update': 'Next'}
		  </Button>
	      : null}
	    {activeStep === 2 ?
		<Button onClick={this.handleSubmitConfirmLiterature}
			  color="primary"
			  variant="contained"
			  disabled={!(royalties.cost > 0 ? Boolean(material.confirmed): true)}>
		    Finish
		  </Button>
	      : null}
          </DialogActions>
       </Dialog>
    );
  }
}

export default CourseLiteratureForm;
