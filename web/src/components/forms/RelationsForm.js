import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Fields } from 'redux-form'
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

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
    const { classes, settings, field, fieldIndex } = this.props;
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
