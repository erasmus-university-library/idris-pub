import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Fields } from 'redux-form'

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class PositionsForm extends React.Component {
  render(){
    const { classes, settings, field, error, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
	  <Field name={`${field}.type`}
		 component={mappedSelect}
		 options={settings.position_types}
		 label="Position Type"
		 className={classes.dateField}
		 InputLabelProps={{shrink: true}}/>
	  <span className={classes.gutter}> </span>
	  <Fields
	    names={[`${field}.group_id`, `${field}._group_name`]}
	    component={mappedRelationField}
	    error={(error||{})['group_id']}
	    placeholder="Organisation"
	    kind="group"
	    className={classes.flex} />
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
      </div>)
  }
}

export default PositionsForm;
