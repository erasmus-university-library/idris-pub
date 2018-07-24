import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Fields } from 'redux-form'

import { mappedTextField, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';



@withStyles(styles, { withTheme: true })
class MembershipsForm extends React.Component {
    render() {
      const { classes, field, error, fieldIndex } = this.props;
      return (
	<div key={fieldIndex} className={classes.formItem}>
	  <div className={classes.formFieldRow}>
	    <Fields names={[`${field}.group_id`, `${field}._group_name`]}
		  component={mappedRelationField}
		  error={(error||{})['group_id']}
		  placeholder="Group"
		  kind="group"
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
        </div>)

    }
}
export default MembershipsForm;
