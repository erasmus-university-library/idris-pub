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
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import PersonIcon from '@material-ui/icons/Person';
import FingerprintIcon from '@material-ui/icons/Fingerprint';

import RecordBar from './RecordBar.js';
import RecordAccordion from './RecordAccordion.js';
import styles from './forms/formStyles.js';



@withStyles(styles)
@reduxForm({form: 'person'})
class PersonDetail extends React.Component {


    componentWillMount(){
       if (this.props.id === 'add'){
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

  getErrorCount(errors) {
    const errorCount = {'person': 0,
			'accounts': 0};

    if (!errors){
      return errorCount;
    }
    for (const field of ['family_name', 'initials', 'given_name',
                         'family_name_prefix', 'alternative_name']){
      if (errors[field] !== undefined){
        errorCount.person += 1;
      }
    }
    for (const error of Object.values(errors.accounts)){
      for (const field of ['type', 'value']){
        if (error[field] !== undefined){
          errorCount.accounts += 1;
        }
      }
    }

    return errorCount
  }

  getLabel(formValues){
    if (formValues.family_name){
      let name = formValues.family_name;
      if (formValues.family_name_prefix){
	name = formValues.family_name_prefix + ' ' + name;
      }
      if (formValues.initials){
	name += (', ' + formValues.initials);
      }
      if (formValues.given_name){
	name += (' (' + formValues.given_name + ')');
      }
      return name;
    } else if (formValues.alternative_name){
      return formValues.alternative_name;
    } else {
      return 'New Person';
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
    const label = this.getLabel(formValues)
    const errorCount = this.getErrorCount(submittedErrors);
    return (
      <div>
      <div className={classes.tabContent}>
	  <Card>
	    <RecordBar label={label} errorCount={errorCount.person} Icon={PersonIcon}/>
	    <Tabs value={currentTab || 0}
		  onChange={this.handleTabClicked}
		  indicatorColor="primary"
		  textColor="primary"
		  centered>
	      <Tab label="Personal Information" />
	      <Tab label="Work Contributions" />
	    </Tabs>
	    {!currentTab?
              <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
		  <CardContent className={classes.cardContainer}>
		      <PersonForm name="person"
				    errors={submittedErrors}/>

			<div className={classes.recordAccordions}>
			    <RecordAccordion
				 open={openedAccordion === 'accounts'}
				 errorCount={errorCount.accounts}
				 Icon={FingerprintIcon}
				 label="Accounts"
				 count={(formValues.accounts||[]).length}
				 onClick={this.handleAccordionClicked('accounts')}>
				<AccountsForm   name="account"
						  typeOptions={settings.account_types} />
				</RecordAccordion>

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
			  </div>
		    </CardContent>
		    <CardActions>
			<Button type="submit" color="primary">
			    Update
			  </Button>
		      </CardActions>
	      </form>: null}
              {currentTab === 1?
		<CardContent className={classes.contributorCard}>
		    <ContributorsListing {...contributorListingState}
					   history={history}
					   id={this.props.id}
					   settings={workSettings}
					   onChange={onContributorChange}
					   onFetch={onContributorFetch} />
		  </CardContent>
            : null}
	    </Card>
      </div>
      </div>
    );
  }
}

export default PersonDetail;
