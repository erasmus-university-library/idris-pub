import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';

import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class WorkForm extends React.Component {
    shouldComponentUpdate(nextProps, nextState){
        if (this.props.open === false && nextProps.open === false){
            return false;
        }
        return true;
    }

    render(){
      const { classes, settings } = this.props;

      return (
        <div className={classes.formItem}>
          <div className={classes.formContainer}>
            <div className={classes.formFieldRow}>
              <Field name="type" component={mappedSelect} options={settings.type} label="Type" className={classes.flex}/>
              <span className={classes.gutter}> </span>
              <Field name="issued"
		     component={mappedTextField}
		     label="Issued Date" type="date"
                     InputLabelProps={{shrink: true}}
		     className={classes.dateField} />
            </div>
            <div className={classes.formFieldRow}>
              <Field name="title"
                     component={mappedTextField}
                     label="Title / Name"
                     multiline
                     rowsMax="4"
                     className={classes.flex}/>
            </div>
          </div>
        </div>
      );
    }
}
export default WorkForm;
