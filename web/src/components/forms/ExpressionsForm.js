import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'

import { mappedTextField, mappedSelect, mappedFileUpload } from '../widgets/mapping.js';
import styles from './formStyles.js';
@withStyles(styles, { withTheme: true })
class ExpressionsForm extends React.Component {
  render(){
    const { classes, settings, field, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
	  <Field name={`${field}.type`}
		 component={mappedSelect}
		 options={settings.expression_types}
		 label="Type" />
	  <span className={classes.gutter}> </span>
	  <Field name={`${field}.format`}
		 component={mappedSelect}
		 options={settings.expression_formats}
		 label="Format" />
	</div>
        <div className={classes.formFieldRow}>
              <Field name={`${field}.blob_id`}
                     component={mappedFileUpload}
                     label="File Upload"
                     className={classes.flex}
                     InputLabelProps={{shrink: true}}/>
        </div>
        <div className={classes.formFieldRow}>
              <Field name={`${field}.uri`}
                     component={mappedTextField}
                     label="External URL"
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
	<div className={classes.formFieldRow}>
	  <Field name={`${field}.access`}
		 component={mappedSelect}
		 options={settings.expression_access}
		 label="Access" />
	</div>
      </div>)}
}
export default ExpressionsForm;
