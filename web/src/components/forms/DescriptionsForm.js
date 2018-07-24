import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';


@withStyles(styles, { withTheme: true })
class DescriptionsForm extends React.Component {
  render() {
    const { classes, settings, field, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
          <Field name={`${field}.type`}
                 component={mappedSelect}
                 options={settings.description_types}
                 label="Description Type"
                 className={classes.dateField}
                 InputLabelProps={{shrink: true}}/>
          <span className={classes.gutter}> </span>
          <Field name={`${field}.format`}
                 component={mappedSelect}
                 options={settings.description_formats}
                 label="Format"
                 className={classes.dateField}
                 InputLabelProps={{shrink: true}}/>
        </div>
        <div className={classes.formFieldRow}>
          <Field name={`${field}.value`}
                 component={mappedTextField}
                 label="Value (Text)"
                 multiline
                 rowsMax="10"
                 className={classes.flex}
                 InputLabelProps={{shrink: true}}/>
        </div>
      </div>
        );

    }
}
export default DescriptionsForm;
