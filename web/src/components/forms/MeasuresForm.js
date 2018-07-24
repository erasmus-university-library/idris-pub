import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';
@withStyles(styles, { withTheme: true })
class MeasuresForm extends React.Component {
  render(){
    const { classes, settings, field, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
	  <Field name={`${field}.type`}
		 component={mappedSelect}
		 options={settings.measure_types}
		 label="Type"
		 className={classes.measureTypeSelect}/>
	  <span className={classes.gutter}> </span>
	  <Field name={`${field}.value`}
		 component={mappedTextField}
		 label="Value"
		 className={classes.flex}/>
	</div>
      </div>)}
}
export default MeasuresForm;
