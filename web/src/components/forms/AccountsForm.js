import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class AccountsForm extends React.Component {
  render(){
    const { classes, settings, field, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
	  <Field name={`${field}.type`}
		 component={mappedSelect}
		 options={settings.account_types}
		 label="Type"
		 className={classes.accountTypeSelect}/>
	  <span className={classes.gutter}> </span>
	  <Field name={`${field}.value`}
		 component={mappedTextField}
		 label="Value (identifier)"
		 className={classes.flex}/>
	</div>
      </div>)}
}
export default AccountsForm;
