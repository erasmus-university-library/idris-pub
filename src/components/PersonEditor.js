import React from 'react';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { reduxForm } from 'redux-form'
import Button from 'material-ui/Button';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';

import PersonForm from './forms/PersonForm';
import AccountsForm from './forms/AccountsForm';
import MembershipsForm from './forms/MembershipsForm';

import styles from './EditorStyles.js';

@withStyles(styles, { withTheme: true })
@reduxForm({form: 'person'})
class PersonEditor extends React.Component {

  handleSubmit = (values) => {
      return this.props.submitRecord(this.props.type,
                                     this.props.id,
                                     values);
  }

  handleAccordionClicked = (name) => (event) => {
      if (this.props.openedAccordion === name){
          this.props.updateRecordDetail({openedAccordion: null});
      } else {
          this.props.updateRecordDetail({openedAccordion: name});
      }
  }

  render() {
      const { classes, record, closeDetailBar, handleSubmit, openedAccordion, submittedErrors, settings } = this.props;
    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography type="headline" color="inherit" noWrap className={classes.flex}>
              {record.name}
            </Typography>
            <IconButton onClick={closeDetailBar}>
               <ChevronRightIcon />
            </IconButton>
        </Toolbar>
        </AppBar>
        <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
        <Card className={classes.editorCard}>
          <CardContent className={classes.noPadding}>
            <List className={classes.noPadding} dense={true}>
              <PersonForm open={openedAccordion === 'person'}
                          name="person"
                          errors={submittedErrors}
                          onAccordionClicked={this.handleAccordionClicked('person')}/>
              <Divider />
              <AccountsForm open={openedAccordion === 'account'}
                            name="account"
                            errors={submittedErrors}
                            typeOptions={settings.account_types}
                            onAccordionClicked={this.handleAccordionClicked('account')}/>
              <Divider />
              <MembershipsForm open={openedAccordion === 'memberships'}
                               name="memberships"
                               errors={submittedErrors}
                               record={record}
                               typeOptions={settings.account_types}
                               onAccordionClicked={this.handleAccordionClicked('memberships')}/>
             </List>
          </CardContent>
        <CardActions>
          <Button type="submit" color="primary">
              Update
          </Button>
        </CardActions>
        </Card>

        </form>
      </div>
    );
  }
}

export default PersonEditor;
