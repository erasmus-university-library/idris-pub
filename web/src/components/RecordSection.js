import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import Chip from '@material-ui/core/Chip';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import TablePagination from '@material-ui/core/TablePagination';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';


import { FieldArray } from 'redux-form'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';


//import styles from './forms/formStyles.js';


const styles = theme => ({

  noPadding: {
      padding: 0,
  },
  errorBGColor: {
    backgroundColor: '#f44336',
  },
  singlePadding: {
    padding: theme.spacing.unit * 1
  },
  doublePadding: {
    padding: theme.spacing.unit * 2
  },
  RecordCard: {
    marginBottom: theme.spacing.unit * 2
  },
  editorCard: {
    minWidth: `calc(100%)`,
  },
  editorContent: {
    padding: theme.spacing.unit * 2,
    paddingBottom: 0
  },
  editorBar: {
    backgroundColor: '#f5f5f5',
    boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0, 0, 0, 0.12)'
  },
  editorSummary: {
    backgroundColor: '#f5f5f5',
  },
  editorError: {
    boxShadow: '0px 2px 4px -1px #f44336,0px 4px 5px 0px #f44336,0px 1px 10px 0px #f44336'
  },
  editorActions: {
    justifyContent: 'flex-end',
    padding: theme.spacing.unit * 1,
    paddingTop: 0
  },
  editorPagination: {
    flexGrow: 1
  },
  editorSearch: {
    marginTop: -theme.spacing.unit * 2,
    marginRight: theme.spacing.unit * 2
  },
  RecordAccordionContainer: {
    paddingTop: theme.spacing.unit * 2
  },
  RecordAccordionHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  RecordAccordionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
  },
  RecordAccordionColumn: {
    flexBasis: '20%',
  },
  RecordAccordionSecondaryColumn: {
    flexBasis: '20%',
    flexGrow: 1
  }
});


const RecordSectionIcon = ({classes, Icon, errorCount}) => {
  if (errorCount > 0){
    return (
      <ListItemIcon>
	<Badge badgeContent={errorCount}
	       color="primary"
	       classes={{colorPrimary: classes.errorBGColor}}><Icon /></Badge>
      </ListItemIcon>);
  } else {
    return (<ListItemIcon><Icon/></ListItemIcon>);
  }

}



@withStyles(styles)
class RecordSection extends React.Component {

  state = {
    limit: 10,
    offset: 0,
    total: 0,
    selected: null,
    query: '',
  };

  handleRowClick = (index) => (event) => {
    if (index === this.state.selected){
      this.setState({selected: null});
    } else {
      const offset = index - (index % this.state.limit);
      this.setState({selected: index, offset});
    }
  }

  handleAddField = (fields, index=null) => (event) => {
    const defaultValue = this.props.defaults || {};
    if (index === null){
      fields.push(defaultValue);
      this.handleRowClick(fields.length)()
    } else {
      fields.insert(index, defaultValue)
      this.handleRowClick(index)()
    }
  }

  handlePageChange = (event, page) => {
    this.setState({offset: page * this.state.limit})
  }

  handleRowsPerPageChange = event => {
    this.setState({offset: 0, limit: event.target.value});
  };

  handleQueryChange = event => {
    // calc new total value
    let query = event.target.value;
    if (query) {
      query = query.toLowerCase();
    } else {
      query = null;
    }
    this.setState({offset: 0,
                   selected: null,
                   query});
  }


  filteredFields = (fields, query) => {
    const result = [];

    fields.forEach(
      (field, index) => {
	if (query) {
	  let match = false;
	  Object.values(fields.get(index)).forEach((value) => {if (value.toLowerCase !== undefined && value.toLowerCase().indexOf(query) !== -1){match = true;}});
	  if (match === false){
	    return;
	  }
	}
	result.push([field, index]);

      })
    return result;
  }

  paginatedFields = (filteredFields, offset, limit) => {
    return filteredFields.slice(offset, offset+limit);
  }

  renderAccordion = ({fields, field, fieldIndex, error, open}) => {
    const {classes, label, fieldLabels, Form, settings} = this.props;

    const value = (fields.get(fieldIndex));
    const labels = fieldLabels(value);
    if (labels[1] !== undefined && labels[1].length > 80){
      labels[1] = labels[1].substr(0, 80) + '…';
    }

    return (
      <ExpansionPanel
	key={fieldIndex}
	expanded={open}
	onChange={this.handleRowClick(fieldIndex)}
	className={error? classes.editorError: null}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={open ? classes.editorBar: classes.editorSummary}>
	  <div className={classes.RecordAccordionColumn}>
	    <Typography className={classes.RecordAccordionHeading}>{labels[0]}</Typography>
	  </div>
	  <div className={classes.RecordAccordionSecondaryColumn}>
	    <Typography className={classes.RecordAccordionSecondaryHeading}>{labels[1]}</Typography>
	  </div>
	</ExpansionPanelSummary>
	{open === true ? ([
	    <ExpansionPanelDetails key={0} className={classes.editorContent}>
		<Form settings={settings} fields={fields} field={field} fieldIndex={fieldIndex} error={error}/>
	      </ExpansionPanelDetails>,
	  <ExpansionPanelActions key={1} className={classes.editorActions}>
	    <Button aria-label="Remove"
			title={`Remove from ${label}`}
			onClick={() => fields.remove(fieldIndex)}><DeleteIcon/> Remove</Button>
	    <Button aria-label="Insert"
			title={`Insert into ${label}`}
			onClick={() => fields.insert(fieldIndex, {})}><AddIcon/> Insert</Button>
	  </ExpansionPanelActions>]) : ( null)}
      </ExpansionPanel>);
    }


  renderFields = ({fields, meta: error, errors, selected, limit, offset, total, query}) => {
    const {classes, name, label, Icon } = this.props;
    let errorCount = 0;
    if (errors){
      errorCount = Object.values(errors).length;
    }
    const filteredFields = this.filteredFields(fields, query);
    const paginatedFields = this.paginatedFields(filteredFields, offset, limit);

    return (
      <Card className={classes.RecordCard}>
	<CardContent className={classes.doublePadding}>
	  <List className={classes.noPadding}>
	    <ListItem className={classes.noPadding}>
	      <RecordSectionIcon
		Icon={Icon}
		errorCount={errorCount}
		classes={classes}/>
	      {fields.length > limit ? (
		<FormControl fullWidth className={classes.editorSearch}>
		  <InputLabel htmlFor={`search-${name}`}>{label}</InputLabel>
		  <Input
                    id={`search-${name}`}
                    type="text"
                    value={query || ''}
                    onChange={this.handleQueryChange}
                    endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
		    />
		</FormControl>

	      ) : (
		<ListItemText primary={label} />
	      )}

	      {fields.length ? (
		<Chip label={filteredFields.length === fields.length ? fields.length : `${filteredFields.length} / ${fields.length}`} align="right" />
	      ) : (
		<IconButton aria-label="Add" onClick={this.handleAddField(fields)}><AddIcon/></IconButton>
	      ) }
      </ListItem>
	</List>
	{fields.length > 0 ? (
	  <div className={classes.RecordAccordionContainer}>
	    {paginatedFields.map((field) => (this.renderAccordion(
	      {fields,
	       field: field[0],
	       fieldIndex: field[1],
	       open: field[1] === this.state.selected,
	       error: (errors||{})[field[1]] || null,
	    })))}
	  </div>
	) : (null)}
      </CardContent>
	{fields.length > 0 ? (
	  <CardActions>
	    <IconButton aria-label="Add" onClick={this.handleAddField(fields)}><AddIcon/></IconButton>
	    {fields.length > limit ? (
	      <div className={classes.editorPagination}>
	      <TablePagination
		component="div"
		labelRowsPerPage="items per page:"
		count={fields.length}
		rowsPerPage={limit}
		page={(offset) / (limit)}
		onChangePage={this.handlePageChange}
		onChangeRowsPerPage={this.handleRowsPerPageChange}>
            </TablePagination></div>) : (null)}

	  </CardActions> ) : (null)
	}
      </Card>
    );
  }

  render() {
    const {name, errors} = this.props;
    const {selected, limit, total, offset, query } = this.state
    return (
      <FieldArray name={name} component={this.renderFields} errors={errors} selected={selected} limit={limit} offset={offset} total={total} query={query} />
    );

  }
}



export default RecordSection;
