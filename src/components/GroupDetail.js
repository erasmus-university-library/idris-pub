import React from 'react';
import { withStyles } from 'material-ui/styles';

import { reduxForm } from 'redux-form'
import Tabs, { Tab } from 'material-ui/Tabs';
import GroupForm from './forms/GroupForm';
import SubGroupsForm from './forms/SubGroupsForm';
import AccountsForm from './forms/AccountsForm';
import MembersListing from './forms/MembersListing';
import AffiliationsListing from './forms/AffiliationsListing';

const styles = theme => ({
  tabContent: {
      margin: theme.spacing.unit * 2
  }
});

@reduxForm({form: 'group'})
class GroupDetail extends React.Component {
    componentWillMount(){
       if (this.props.id === 'add'){
           this.props.changeAppHeader('Add Group');
           this.props.onFetch(null);
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
    const { classes, handleSubmit, openedAccordion, submittedErrors,
            settings, onMemberChange, onMemberFetch, onMemberSubmit, onMemberAdd,
            onSubgroupChange, onSubgroupFetch, subgroupListingState,
            memberListingState, history, currentTab, formValues,
            affiliationListingState, workSettings, onAffiliationChange, onAffiliationFetch
           } = this.props;

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
        <Tab label="Group Information" />
        <Tab label="Affiliated Works" />
      </Tabs>
      <div className={classes.tabContent}>
        {!currentTab?
         <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
            <GroupForm open={openedAccordion === 'group' || openedAccordion === undefined}
                       name="group"
                       errors={submittedErrors}
                       typeOptions={settings.type}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('group')}/>
            <AccountsForm open={openedAccordion === 'account'}
                          name="account"
                          errors={submittedErrors}
                          formValues={formValues.accounts || []}
                          typeOptions={settings.account_types}
                          onAccordionClicked={this.handleAccordionClicked('account')}/>
            <MembersListing open={openedAccordion === 'members'}
                            name="members"
                            id={this.props.id}
                            history={history}
                            {...memberListingState}
                            onAccordionClicked={this.handleAccordionClicked('members')}
                            onChange={onMemberChange}
                            onFetch={onMemberFetch}
                            onSubmit={onMemberSubmit}
                            onMemberAdd={onMemberAdd} />
            <SubGroupsForm open={openedAccordion === 'subgroups'}
                           name="subgroups"
                           id={this.props.id}
                           history={history}
                           {...subgroupListingState}
                           onAccordionClicked={this.handleAccordionClicked('subgroups')}
                           onChange={onSubgroupChange}
                           onFetch={onSubgroupFetch} />
        </form>: null}
        {currentTab === 1?
           <AffiliationsListing {...affiliationListingState}
                                 history={history}
                                 id={this.props.id}
                                 settings={workSettings}
                                 onChange={onAffiliationChange}
                                 onFetch={onAffiliationFetch} />
         : null}
        </div>
        </div>
    );
  }
}

export default withStyles(styles)(GroupDetail);
