import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, FieldArray } from 'redux-form'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class AccountsForm extends React.Component {
  renderAccounts = (accounts) => {
    const { classes, typeOptions } = this.props;
    return (
      <div>
        {accounts.fields.map((account, accountIndex) =>
			     <div key={accountIndex} className={classes.formItem}>
				 <Field name={`${account}.type`}
					  component={mappedSelect}
					  options={typeOptions}
					  label="Type"
					  className={classes.accountTypeSelect}/>
				   <span className={classes.gutter}> </span>
				     <Field name={`${account}.value`}
					      component={mappedTextField}
					      label="Value (identifier)"
					      className={classes.flex}/>
				       <IconButton aria-label="Delete"
						     onClick={() => accounts.fields.remove(accountIndex)}>
					   <DeleteIcon />
					 </IconButton>
			     </div>)}
        <div className={classes.fabButtonRight}>
        <Button color="primary" aria-label="add" onClick={() => accounts.fields.push({})} >
        <AddIcon /> Add Account
      </Button>
      </div>
      </div>);
  }

  render(){
        const { classes } = this.props;
        return (
          <FieldArray name="accounts" component={this.renderAccounts} />
        );
    }
}
export default AccountsForm;
