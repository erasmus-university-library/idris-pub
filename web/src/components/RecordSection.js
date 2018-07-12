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

import { Field, FieldArray } from 'redux-form'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

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
  editorPanel: {
    backgroundColor: '#f5f5f5',
    boxShadow: '0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0, 0, 0, 0.12)'
  },
  editorError: {
    boxShadow: '0px 2px 4px -1px #f44336,0px 4px 5px 0px #f44336,0px 1px 10px 0px #f44336'
  },
  editorActions: {
    justifyContent: 'flex-start',
    padding: theme.spacing.unit * 1,
    paddingTop: 0
  },
  RecordAccordionContainer: {
    paddingTop: theme.spacing.unit * 2
  },
  RecordAccordionHeading: {
    fontSize: theme.typography.pxToRem(15),
  },
  RecordAccordionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
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

const RecordAccordion = ({classes, fields, field, fieldIndex, error, open, onRowClick, fieldLabels, Form, settings}) => {
  const value = (fields.get(fieldIndex));
  const labels = fieldLabels(value);
  return (<ExpansionPanel expanded={open} onChange={onRowClick} className={error? classes.editorError: null}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.editorPanel}>
	  <div className={classes.RecordAccordionColumn}>
	  <Typography className={classes.RecordAccordionHeading}>{labels[0]}</Typography>
	  </div>
	  <div className={classes.RecordAccordionSecondaryColumn} style={{flexGrow:1}}>
	  <Typography className={classes.RecordAccordionSecondaryHeading}>{labels[1]}</Typography>
	  </div>
	  </ExpansionPanelSummary>
	  {open === true ? ([
            <ExpansionPanelDetails className={classes.editorContent}>
	      <Form settings={settings} fields={fields} field={field} fieldIndex={fieldIndex} error={error}/>
	      </ExpansionPanelDetails>,
	    <ExpansionPanelActions className={classes.editorActions}>
	      <IconButton aria-label="Remove" onClick={() => fields.remove(fieldIndex)}><DeleteIcon/></IconButton>
	    </ExpansionPanelActions>]) : (null)}
	  </ExpansionPanel>);
}

const RecordCard = ({classes, errors, label, onRowClick, onAddField, selectedField, Icon, fields, fieldLabels, settings, Form}) => {
  let errorCount = 0;
  if (errors){
    errorCount = Object.values(errors).length;
  }
    return (
      <Card className={classes.RecordCard}>
	<CardContent className={classes.doublePadding}>
	  <List className={classes.noPadding}>
	    <ListItem className={classes.noPadding}>
	      <RecordSectionIcon
		Icon={Icon}
		errorCount={errorCount}
		classes={classes}/>
	      <ListItemText primary={label} />
	      {fields.length ? (
		<Chip label={fields.length} align="right" />
	      ) : (
		<IconButton aria-label="Add" onClick={onAddField(fields)}><AddIcon/></IconButton>
	      ) }
      </ListItem>
	</List>
	{fields.length > 0 ? (
	<div className={classes.RecordAccordionContainer}>
	{fields.map((field, fieldIndex) => (
	  <RecordAccordion
	    key={field}
	    open={fieldIndex === selectedField}
	    onRowClick={onRowClick(fieldIndex)}
	    classes={classes}
	    fields={fields}
	    field={field}
	    error={(errors||{})[fieldIndex] || null}
	    fieldIndex={fieldIndex}
	    fieldLabels={fieldLabels}
	    Form={Form}
	    settings={settings}/>))}
	  </div>
	) : (null)}
	</CardContent>
	{fields.length > 0 ? (
	  <CardActions>
	    <IconButton aria-label="Add" onClick={onAddField(fields)}><AddIcon/></IconButton>
	  </CardActions> ) : (null)
	}
      </Card>
    );

}

@withStyles(styles)
class RecordSection extends React.Component {

  state = {
    limit: 5,
    offset: 0,
    total: 0,
    selected: null,
    query: '',
  };

  handleRowClick = (index) => (event) => {
    if (index === this.state.selected){
      this.setState({selected: null});
    } else {
      this.setState({selected: index});
    }
  }

  handleAddField = (fields) => (event) => {
    fields.push({});
    this.handleRowClick(fields.length)()
  }


  renderFields = ({fields, meta: error, errors, selected}) => {
    const {classes, name, label, Icon, fieldLabels, Form, settings} = this.props;
    return (
      <RecordCard
	classes={classes}
	label={label}
	errors={errors[name]}
	fields={fields}
	Icon={Icon}
	Form={Form}
	settings={settings}
	selectedField={selected}
	fieldLabels={fieldLabels}
	onRowClick={this.handleRowClick}
	onAddField={this.handleAddField}>
      </RecordCard>)
  }

  render() {
    const {name, errors} = this.props;
    return (
      <FieldArray name={name} component={this.renderFields} errors={errors} selected={this.state.selected} />
    );

  }
}



export default RecordSection;
