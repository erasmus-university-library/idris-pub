import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import { Link } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ListItemText  from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Divider from '@material-ui/core/Divider';

import IdrisSDK from '../sdk.js';
const sdk = new IdrisSDK();

const styles = theme => ({
  formControl: {
    width: '100%',
  },
  formControlSelect: {
      minWidth: 200,
      maxWidth: 350,
  },
  searchText: {
    maxWidth: '85%',
    textOverflow: 'ellipsis'
  }
});

@withStyles(styles)
class CourseGroupListing extends Component {

  state = {query: '',
	   loading: false,
	   courseYear: null};
  courseYears = [];
  groupName = '';
  courses = [];
  filteredCourses = null;

  componentDidMount(props){
    this.selectCourseYears();
  }

  componentDidUpdate(prevProps, prevState){
    if (this.state.courseYear === null && this.props.navigation.length){
      this.selectCourseYears();
    }

    if (this.props.id && this.props.id !== prevProps.id){
      this.setState({query: '', courseYear: null});
    }

    if (this.state.courseYear !== prevState.courseYear && this.state.courseYear !== null){
      this.setState({loading: true});
      sdk.load('course',
	       `records?group_id=${this.props.id}&course_year=${this.state.courseYear}`).then(
		 response => response.json(),
                 error => {console.log('RelationField Error: ' + error)})
        .then(data => {
	  this.courses = data;
	  this.setState({loading: false});
        });
    }

    if (this.state.query !== prevState.query){
      const query = this.state.query.toLowerCase();
      this.filteredCourses = [];
      this.courses.forEach((course) => {
	if (course.title.toLowerCase().indexOf(query) !== -1){
	  this.filteredCourses.push(course);
	}
      });
      // note, that filtering does not change state or props
      // so we need to force a render
      this.forceUpdate();
    }

  }

  handleYearChange = (e) => {
    this.setState({courseYear: e.target.value});
  }

  handleQueryChange = (e) => {
    this.setState({query: e.target.value});
  }

  selectCourseYears = () => {
    const { navigation, id } = this.props;
    this.groupName = null;
    this.courseYears = [];
    navigation.forEach((group) => {
      if ( group.id == id ) {
	this.groupName = group.name;
	const years = Object.keys(group.years);
	years.sort();
	years.reverse();
	years.forEach((year) => {
	  this.courseYears.push({'year': year, 'courses': group.years[year]})
	});
	if (this.courseYears.length > 0){
	  this.setState({courseYear: this.courseYears[0].year});
	}
      }
    })

  }

  render(){
    const { query, courseYear, loading } = this.state;
    const { classes } = this.props;
    const groupName = this.groupName;
    const courseYears = this.courseYears;
    return (
      <Paper>
        <AppBar position="sticky" color="default">
          <Toolbar>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search" classes={{root: classes.searchText}}>
                <Typography variant="body1" color="inherit" noWrap>
		  {`${groupName} courses`}
		</Typography>
	      </InputLabel>
              <Input
                id="search"
                type="text"
                value={query}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
		/>
            </FormControl>
            <FormControl className={classes.formControlSelect}>
              <InputLabel shrink={true} htmlFor="course-year">Course Year</InputLabel>
              <Select
		value={courseYear||''}
		onChange={this.handleYearChange}
		inputProps={{
		  name: 'course_year',
		  id: 'course-year',
		}}
		>
		{courseYears.map(year => (
		  <MenuItem key={year.year} value={year.year}>
		    <Typography style={{float:'left', lineHeight: 'inherit', marginRight: '0.5em'}}
				variant="body1"
				component="span">{`${year.year}`}</Typography>
		    <Typography variant="caption">{`(${year.courses} course${year.courses === 1? '': 's'})`}</Typography>
		  </MenuItem>
		))}
      </Select>
        </FormControl>
	</Toolbar>
	</AppBar>
	{loading? <LinearProgress /> : null}
	<List dense>
	{(this.filteredCourses || this.courses).map((course) => {
	  const datefmt = { month: 'long', day: 'numeric' };
	  const startDate = new Date(Date.parse(course.start_date));
	  const endDate = new Date(Date.parse(course.end_date));
	  const days = ((endDate - startDate) / 60 / 60 / 24 / 1000);
	  const message = `${course.literature===0?'no':course.literature} literature item${course.literature === 1?'':'s'}, ${days} day${days===1?'':'s'} from ${startDate.toLocaleDateString('en-us', datefmt)} until ${endDate.toLocaleDateString('en-us', datefmt)}`;

	return (
	  [<ListItem key={course.id} button to={`/course/${course.id}`} component={Link}>
	    <Avatar><AssignmentIcon /></Avatar>
  	    <ListItemText primary={course.title}
			  secondary={message}/>
	   </ListItem>,
	   <Divider inset key={`${course.id}-divider`} />]
	   )})}
	 </List>

      </Paper>);
    }
}

export default CourseGroupListing;
