import React from 'react';
import { withStyles } from 'material-ui/styles';

import Card, { CardActions, CardContent } from 'material-ui/Card';
import { reduxForm } from 'redux-form'
import Button from 'material-ui/Button';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Tabs, { Tab } from 'material-ui/Tabs';

import PersonForm from './forms/PersonForm';
import AccountsForm from './forms/AccountsForm';
import MembershipsForm from './forms/MembershipsForm';


const styles = theme => ({
    headerText: {
        flex:1
    },
    fabButtonRight: {
        padding: theme.spacing.unit,
        display: 'flex',
        justifyContent: 'flex-end',
        flex: 1
    },
});


@withStyles(styles, { withTheme: true })
@reduxForm({form: 'person'})
class PersonDetail extends React.Component {


    componentWillMount(){
       if (this.props.id === 'add'){
           this.props.changeAppHeader('Add Person');
           this.props.onFetch(null)
       } else {
           this.props.onFetch(this.props.id);
       }

    }

  handleSubmit = (values) => {
      let id = this.props.id;
      if (this.props.id === 'add'){
          id = null;
      }
      this.props.onSubmit(id, values);
  }

  handleAccordionClicked = (name) => (event) => {
      if (this.props.openedAccordion === name){
          this.props.onChange({openedAccordion: null});
      } else {
          this.props.onChange({openedAccordion: name});
      }
  }

  handleTabClicked = (event, value) => {
      this.props.onChange({currentTab: value});
  }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
           this.props.onFetch(nextProps.id);
        }
    }

  render() {
    const { classes, record, handleSubmit, openedAccordion, submittedErrors,
            settings, currentTab } = this.props;
    if (parseInt(this.props.id, 10) > 0){
        if((record || {}).id !== parseInt(this.props.id, 10)){
            return null
        }
    }
    return (
      <div>
      <Tabs value={currentTab || 0}
            onChange={this.handleTabClicked}
            indicatorColor="primary"
            textColor="primary"
            centered>
        <Tab label="Personal Information" />
        <Tab label="Group Memberships" />
        <Tab label="Work Contributions" />
      </Tabs>
        {!currentTab?
        <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
        <Card className={classes.editorCard}>
          <CardContent className={classes.noPadding}>
            <List dense={true}>
              <PersonForm open={openedAccordion === 'person' || openedAccordion === undefined}
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
                               typeOptions={[]}
                               onAccordionClicked={this.handleAccordionClicked('memberships')}/>
             </List>
          </CardContent>
        <CardActions>
          <Button type="submit" color="primary">
              Update
          </Button>
        </CardActions>
        </Card>
        </form>: null}

      </div>
    );
  }
}

export default PersonDetail;
