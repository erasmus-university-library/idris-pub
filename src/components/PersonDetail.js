import React from 'react';

import { reduxForm } from 'redux-form'
import Tabs, { Tab } from 'material-ui/Tabs';

import PersonForm from './forms/PersonForm';
import AccountsForm from './forms/AccountsForm';
import MembershipsForm from './forms/MembershipsForm';

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
    const { record, handleSubmit, openedAccordion, submittedErrors,
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
            <PersonForm open={openedAccordion === 'person' || openedAccordion === undefined}
                        name="person"
                        errors={submittedErrors}
                        onAccordionClicked={this.handleAccordionClicked('person')}/>
            <AccountsForm open={openedAccordion === 'account'}
                          name="account"
                          errors={submittedErrors}
                          typeOptions={settings.account_types}
                          onAccordionClicked={this.handleAccordionClicked('account')}/>
            <MembershipsForm open={openedAccordion === 'memberships'}
                             name="memberships"
                             errors={submittedErrors}
                             record={record}
                             typeOptions={[]}
                             onAccordionClicked={this.handleAccordionClicked('memberships')}/>
        </form>: null}

      </div>
    );
  }
}

export default PersonDetail;
