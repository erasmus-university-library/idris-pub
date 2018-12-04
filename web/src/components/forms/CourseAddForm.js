import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import styles from './formStyles.js';

@withStyles(styles)
class CourseAddForm extends Component {

  state = {
    title: '',
    start_date: '',
    end_date: '',
    course_id: '',
    canvas_id: '',
  }
  componentDidMount = (props) => {
    console.log(this.props)
    if (Boolean(this.props.course)){
      const course = this.props.course;
      this.setState({title: course.title,
		     start_date: course.start_date,
		     end_date: course.end_date})
    }
  }
  handleChange = (name) => (event) => {
    this.setState({[name]: event.target.value});
  }

  handleSubmit = (event) => {
    this.props.onSubmit(this.state);
  }

  handleClose = () => {
    this.props.onClose();
  }

  render() {
    const { classes, course } = this.props;
    const isEditForm = Boolean(course);
    return (
      <Dialog open={this.props.open !== false}
	      onClose={this.handleClose}>
        <DialogTitle>
	  {isEditForm ? 'Edit Course' : 'Add Course'}
	</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter course details.
          </DialogContentText>
          <form className={classes.formItem} noValidate autoComplete="off">
	    <div className={classes.formFieldRow}>
            <TextField
	      id="title"
	      label="Course Name"
	      value={this.state.title}
	      className={classes.flex}
	      onChange={this.handleChange('title')}
	      margin="dense"
	      />
	    </div>
	    <div className={classes.formFieldRow}>
	      <TextField
		id="start_date"
		label="Start Date"
		className={classes.gutteredLeftField}
		type="date"
		value={this.state.start_date}
                InputLabelProps={{shrink: true}}
		onChange={this.handleChange('start_date')}
		margin="dense"
		/>
              <TextField
		id="end_date"
		label="End Date"
		className={classes.gutteredRightField}
		type="date"
                InputLabelProps={{shrink: true}}
		value={this.state.end_date}
		onChange={this.handleChange('end_date')}
		margin="dense"
		/>
	    </div>
	    {isEditForm ? null :
	    <div className={classes.formFieldRow}>
	      <TextField
		id="course_id"
		className={classes.gutteredLeftField}
		label="Course Code"
		type="text"
		value={this.state.course_id}
		onChange={this.handleChange('course_id')}
		margin="dense"
		/>
              <TextField
		id="canvas_id"
		className={classes.gutteredRightField}
		label="Canvas id"
		type="text"
		value={this.state.canvas_id}
		onChange={this.handleChange('canvas_id')}
		margin="dense"
		/>
	      </div>
	    }
          </form>
        </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleSubmit} color="primary"
                    disabled={!(Boolean(this.state.title) &&
				Boolean(this.state.start_date) &&
				Boolean(this.state.end_date))}>
	      {isEditForm ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
       </Dialog>
    );
  }
}

export default CourseAddForm;
