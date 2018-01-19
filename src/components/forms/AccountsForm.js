import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import { Field, FieldArray } from 'redux-form'
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import FingerprintIcon from 'material-ui-icons/Fingerprint';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';
import Badge from 'material-ui/Badge';


import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class AccountsForm extends React.Component {


    getErrorCount() {
        if (!this.props.errors || !this.props.errors.accounts){
            return 0
        }
        let errorCount = 0;
        for (const error of Object.values(this.props.errors.accounts)){
          for (const field of ['type', 'value']){
              if (error[field] !== undefined){
                errorCount += 1;
              }
          }
        }
        return errorCount
    }

    renderAccounts = (accounts) => {
        const { classes, typeOptions } = this.props;
        return (<div>
              <ul className={classes.noPadding}>
              {accounts.fields.map((account, accountIndex) =>
           <li key={accountIndex} className={classes.flexContainer}>
             <Field name={`${account}.type`} component={mappedSelect} options={typeOptions} label="Type" className={classes.accountTypeSelect}/>
             <span className={classes.gutter}> </span>
             <Field name={`${account}.value`} component={mappedTextField} label="Value (identifier)" className={classes.flex}/>
             <IconButton aria-label="Delete" onClick={() => accounts.fields.remove(accountIndex)}><DeleteIcon /></IconButton>
           </li>)}
              </ul>
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="add" onClick={() => accounts.fields.push({})} >
                <AddIcon /> Add Account
              </Button>
              </div>
            </div>)

    }

    render(){
        const { classes, onAccordionClicked, open } = this.props;
        const errorCount = this.getErrorCount();
        return (<div><ListItem button onClick={onAccordionClicked} disableRipple={true}>
            <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><FingerprintIcon /></Badge>: <FingerprintIcon />}</ListItemIcon>
            <ListItemText primary="Accounts" />
            <ListItemIcon>{open ? <ExpandLess />: <ExpandMore />}</ListItemIcon>
          </ListItem>
          <Collapse in={open} unmountOnExit>
          <Card>
          <CardContent className={classes.accordionCard}>
          <FieldArray name="accounts" component={this.renderAccounts} />
        </CardContent>
        </Card>
        </Collapse>
          </div>);
    }
}
export default AccountsForm;
