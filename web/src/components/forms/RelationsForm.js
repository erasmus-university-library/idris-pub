import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Fields, FieldArray } from 'redux-form'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import LanguageIcon from '@material-ui/icons/Language';
import Badge from '@material-ui/core/Badge';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Link } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';


@withStyles(styles, { withTheme: true })
class RelationsForm extends React.Component {
    state = {
        targetWorkTypeFilter: 'journal',
    };



    handleTargetWorkTypeFilterChange = event => {
        this.setState({targetWorkTypeFilter: event.target.value})
    }

  render() {
    const { classes, settings, fields, field, fieldIndex } = this.props;
    const { targetWorkTypeFilter } = this.state;

    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
            <Field name={`${field}.type`}
                   component={mappedSelect}
                   options={settings.relation_types}
                   label="Relation Type"
                   className={classes.dateField}
                   InputLabelProps={{shrink: true}}/>
            <span className={classes.gutter}> </span>
            <FormControl className={classes.formControlSelect}>
              <InputLabel htmlFor="target-work-type-filter">Work Type</InputLabel>
              <Select  value={targetWorkTypeFilter}
                       onChange={this.handleTargetWorkTypeFilterChange}
                       inputProps={{id: 'target-work-type-filter'}}>
                <MenuItem value="">
                  <em>All</em>
                </MenuItem>
                {settings.type.map(type => (
		  <MenuItem key={type.id}
			    value={type.id}>{type.label}</MenuItem>))}</Select>
        </FormControl>
             <span className={classes.gutter}> </span>
             <Fields names={[`${field}.target_id`, `${field}._target_name`]}
                    component={mappedRelationField}
                    placeholder="Work"
                    kind="work"
                    filters={{type:targetWorkTypeFilter}}
                    className={classes.flex} />
            </div>
            <div className={classes.formFieldRow}>
             <Field name={`${field}.volume`}
                    component={mappedTextField}
                    label="Volume"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.issue`}
                    component={mappedTextField}
                    label="Issue"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.number`}
                    component={mappedTextField}
                    label="(Report) Number"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
            <Field name={`${field}.starting`}
                    component={mappedTextField}
                    label="Starting (Page)"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.ending`}
                    component={mappedTextField}
                    label="Ending (Page)"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.total`}
                    component={mappedTextField}
                    label="Total (Page)"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
            </div>
            <div className={classes.formFieldRow}>
             <Field name={`${field}.description`}
                    component={mappedTextField}
                    label="Description"
                    multiline
                    rowsMax="4"
                    className={classes.flex}/>
            </div>
            <div className={classes.formFieldRow}>
             <Field name={`${field}.location`}
                    component={mappedTextField}
                    label="Location"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.start_date`}
                    component={mappedTextField}
                    label="Start Date"
                    type="date"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.end_date`}
                    component={mappedTextField}
                    label="End Date"
                    type="date"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
        </div>
	</div>
    );

    }
}
export default RelationsForm;
