import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { reduxForm } from 'redux-form'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Zoom from '@material-ui/core/Zoom';

import GroupForm from './forms/GroupForm';
import SubGroupsForm from './forms/SubGroupsForm';
import AccountsForm from './forms/AccountsForm';
import MembersListing from './forms/MembersListing';
import AffiliationsListing from './forms/AffiliationsListing';

import GroupIcon from '@material-ui/icons/Group';
import FingerprintIcon from '@material-ui/icons/Fingerprint';


import RecordBar from './RecordBar.js';
import RecordSection from './RecordSection.js';


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

    const errors = submittedErrors || {};
    const label = formValues.international_name || '';
    const errorCount = Object.values(errors).length;


    return (
      <div>
      <div className={classes.tabContent}>
	  <Card>
	    <RecordBar label={label} errorCount={errorCount} Icon={GroupIcon}/>
	    <Tabs value={currentTab || 0}
		  onChange={this.handleTabClicked}
		  indicatorColor="primary"
		  textColor="primary"
		  centered>
              <Tab label="Group Information" />
              <Tab label="Subgroups" />
              <Tab label="Memberships" />
              <Tab label="Affiliated Works" />
	    </Tabs>
        {!currentTab?
         <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
	     <CardContent className={classes.cardContainer}>
		 <GroupForm open={openedAccordion === 'group' || openedAccordion === undefined}
			      name="group"
			      errors={submittedErrors}
			      settings={settings}
			      history={history}
			      onAccordionClicked={this.handleAccordionClicked('group')}/>
		   <div className={classes.recordAccordions}>
		       <RecordSection label="Accounts"
					errors={errors}
					name="accounts"
					settings={settings}
					Icon={FingerprintIcon}
					Form={AccountsForm}
					fieldLabels = {(value) => ([(settings.account_types.filter((type) => (type.id === value.type? type.label : null))[0]||{}).label||null, value.value])}
			   >
			 </RecordSection>
		     </div>
	       </CardContent>
         </form>: null}
         {currentTab === 1?
           (
	     <CardContent className={classes.cardContainer}>
	       <SubGroupsForm name="subgroups"
			      id={this.props.id}
			      history={history}
			      {...subgroupListingState}
			      onChange={onSubgroupChange}
			      onFetch={onSubgroupFetch} />
	   </CardContent>)
	  : (null)}
         {currentTab === 2?
           (
	     <CardContent className={classes.cardContainer}>
	       <MembersListing
                 name="members"
                 id={this.props.id}
                 history={history}
                 {...memberListingState}
                 onChange={onMemberChange}
                 onFetch={onMemberFetch}
                 onSubmit={onMemberSubmit}
                 onMemberAdd={onMemberAdd} />
	   </CardContent>)
	  : (null)}
         {currentTab === 3?
	  (<CardContent className={classes.cardContainer}>
           <AffiliationsListing {...affiliationListingState}
                                 history={history}
                                 id={this.props.id}
                                 settings={workSettings}
                                 onChange={onAffiliationChange}
                                 onFetch={onAffiliationFetch} />
	   </CardContent>)
         : null}
	  </Card>
      </div>
      </div>
    );
    /*
    foo = (
      <div>
	<Card>
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
	<CardContent className={classes.contributorCard}>
           <AffiliationsListing {...affiliationListingState}
                                 history={history}
                                 id={this.props.id}
                                 settings={workSettings}
                                 onChange={onAffiliationChange}
                                  onFetch={onAffiliationFetch} />
	  </CardContent>
         : null}
        </div>
        </div>
    );*/
  }
}

export default withStyles(styles)(GroupDetail);
