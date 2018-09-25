import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ListItemText  from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  formControl: {
    width: '100%',
  },
  courseYearLabel: {
    display: 'inline',
    marginRight: '0.5em'
  },
  dateField: {
      width: 180,
  },
  link: {
     color: 'black',
     marginRight: '0.5em',
     textDecoration: 'none',
      '&:hover': {
          textDecoration: 'underline'
      }
  },
  formControlSelect: {
      minWidth: 200,
      maxWidth: 350,
  },
  table: {
      marginTop: theme.spacing.unit
  },
  nobr: {
      whiteSpace: 'nowrap'
  },
  fabButtonRight: {
      padding: theme.spacing.unit,
      display: 'flex',
      justifyContent: 'flex-end',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
});

@withStyles(styles)
class CourseGroupListing extends Component {

  state = {groupId: null,
	   courseYear: null}

    handleRowClick = (record) => (event) => {
        this.props.history.push(`/course/work/${record.id}`);
        this.props.onChange({selected: record.id});
    }

  handleYearChange = (e) => {
    console.log('year change');
  }

  render(){
    const { classes, navigation, id } = this.props;
    let groupName = null;
    let courseYears = [];
    let startYear = ''
    navigation.forEach((group) => {
      if ( group.id == id ) {
	groupName = group.name;
	const years = Object.keys(group.years);
	years.sort();
	years.reverse();
	years.forEach((year) => {
	  courseYears.push({'year': year, 'courses': group.years[year]})
	});
	if (courseYears.length > 0){
	  startYear = courseYears[0].year;
	}
      }
    })
    return (
      <Paper>
        <AppBar position="static" color="default">
          <Toolbar>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">{`${groupName} courses`}</InputLabel>
              <Input
                id="search"
                type="text"
                value={''}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
		/>
            </FormControl>
            <FormControl className={classes.formControlSelect}>
              <InputLabel htmlFor="course-year">Course Year</InputLabel>
              <Select
		value={startYear}
		onChange={this.yearChange}
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
      </Paper>);
    }
}

export default CourseGroupListing;
