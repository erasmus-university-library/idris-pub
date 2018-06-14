import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { reduxForm } from 'redux-form'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import PersonForm from './forms/PersonForm';
import AccountsForm from './forms/AccountsForm';
import MembershipsForm from './forms/MembershipsForm';
import ContributorsListing from './forms/ContributorsListing';
import PositionsForm from './forms/PositionsForm';

const styles = theme => ({
  tabContent: {
      margin: theme.spacing.unit * 2
  }
});

@withStyles(styles)
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
          this.props.onDetailChange({openedAccordion: null});
      } else {
          this.props.onDetailChange({openedAccordion: name});
      }
  }

  handleTabClicked = (event, value) => {
      this.props.onDetailChange({currentTab: value});
  }

    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
           this.props.onFetch(nextProps.id);
        }
    }

  render() {
    const { classes, record, handleSubmit, openedAccordion, submittedErrors,
            settings, currentTab, history, formValues,
            contributorListingState, workSettings,
            onContributorFetch, onContributorChange } = this.props;

     if (formValues === undefined){
          return null;
     }
    return (
      <div>
      <Tabs value={currentTab || 0}
            onChange={this.handleTabClicked}
            indicatorColor="primary"
            textColor="primary"
            centered>
        <Tab label="Personal Information" />
        <Tab label="Work Contributions" />
      </Tabs>
      <div className={classes.tabContent}>
        {!currentTab?
        <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
            <PersonForm open={openedAccordion === 'person' || openedAccordion === undefined}
                        name="person"
                        errors={submittedErrors}
                        onAccordionClicked={this.handleAccordionClicked('person')}/>
            <AccountsForm open={openedAccordion === 'account'}
                          name="account"
                          errors={submittedErrors}
                          formValues={formValues.accounts||[]}
                          typeOptions={settings.account_types}
                          onAccordionClicked={this.handleAccordionClicked('account')}/>
            <MembershipsForm open={openedAccordion === 'memberships'}
                             name="memberships"
                             errors={submittedErrors}
                             formValues={formValues.memberships||[]}
                             record={record}
                             typeOptions={[]}
                             onAccordionClicked={this.handleAccordionClicked('memberships')}/>
            <PositionsForm open={openedAccordion === 'positions'}
                       name="positions"
                       errors={submittedErrors}
                       formValues={formValues.positions||[]}
                       positionOptions={settings.position_types}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('positions')}/>
        </form>: null}
        {currentTab === 1?
           <ContributorsListing {...contributorListingState}
                                history={history}
                                id={this.props.id}
                                settings={workSettings}
                                onChange={onContributorChange}
                                onFetch={onContributorFetch} />
         : null}
        </div>
      </div>
    );
  }
}

export default PersonDetail;
