import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'

import { mappedTextField } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class PersonForm extends React.Component {

    render(){
      const { classes } = this.props;
      return (
     <div className={classes.formItem}>
       <div className={classes.formContainer}>
         <div className={classes.formFieldRow}>
	   <Field name="family_name"
		  component={mappedTextField}
		  label="Family Name"
		  className={classes.flex}/>
	   <span className={classes.gutter}> </span>
	   <Field name="family_name_prefix"
		  component={mappedTextField}
		  label="Family Name Prefix"/>
         </div>
         <div className={classes.formFieldRow}>
	   <Field name="given_name"
		  component={mappedTextField}
		  className={classes.flex}
		  label="Given Name"/>
	   <span className={classes.gutter}> </span>
	   <Field name="initials"
		  component={mappedTextField}
		  label="Initials"/>
	   <span className={classes.gutter}> </span>
	   <Field name="alternative_name"
                  component={mappedTextField}
                  multiline
                  label="Alternative Name(s)"
                  className={classes.flex}/>
         </div>
       </div>
     </div>
      );
    }
}
export default PersonForm;
