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
import Zoom from '@material-ui/core/Zoom';

import PersonIcon from '@material-ui/icons/Person';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import CardMembershipIcon from '@material-ui/icons/CardMembership';
import WorkIcon from '@material-ui/icons/Work';
import SaveIcon from '@material-ui/icons/Save';

import RecordBar from './RecordBar.js';
import RecordSection from './RecordSection.js';
import styles from './forms/formStyles.js';

@withStyles(styles)
@reduxForm({form: 'person'})
class PersonDetail extends React.Component {


  componentDidMount(){
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.id !== this.props.id){
      this.props.onFetch(nextProps.id);
    }
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
    const { classes, handleSubmit, submittedErrors,
            settings, currentTab, history, formValues,
            contributorListingState, workSettings, onDelete,
            onContributorFetch, onContributorChange } = this.props;
     if (formValues === undefined){
          return null;
     }
    const errors = submittedErrors || {};
    const label = this.getLabel(formValues)
    const errorCount = Object.values(errors).length;
    return (
      <div>
      <div className={classes.tabContent}>
	  <Card>
	    <RecordBar label={label} errorCount={errorCount} Icon={PersonIcon} onDelete={() => {onDelete(formValues.id)}}/>
	    <Tabs value={currentTab || 0}
		  onChange={this.handleTabClicked}
		  indicatorColor="primary"
		  textColor="primary"
		  centered>
	      <Tab label="Personal Information" />
	      <Tab label="Work Contributions" />
	    </Tabs>
	    {!currentTab? (
              <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
		<CardContent className={classes.cardContainer}>
		  <PersonForm name="person" />
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
		  <RecordSection label="Affiliations"
				 errors={errors}
				 name="memberships"
				 settings={settings}
				 Icon={CardMembershipIcon}
				 Form={MembershipsForm}
				 fieldLabels = {(value) => ([value.start_date ? value.end_date ? `${value.start_date.substr(0, 4)} - ${value.end_date.substr(0, 4)}` : `${value.start_date.substr(0, 4)} - ∞`: value.end_date ? `∞ - ${value.end_date.substr(0, 4)}`: '∞', value._group_name])}
				 >
		  </RecordSection>
		  <RecordSection label="External employment and side positions"
				 errors={errors}
				 name="positions"
				 settings={settings}
				 Icon={WorkIcon}
				 Form={PositionsForm}
				 fieldLabels = {(value) => ([(settings.position_types.filter((type) => (type.id === value.type? type.label : null))[0]||{}).label||null, value._group_name])}
		    >
		  </RecordSection>
		  </div>
		</CardContent>
		<CardActions>
		  <Zoom in={true} className={classes.SaveButton}>
		  <Button variant="fab" type="submit" color="primary">
		    <SaveIcon />
		  </Button>
		  </Zoom>
		</CardActions>
	      </form>) : (null)}
      {currentTab === 1? (
	<CardContent className={classes.contributorCard}>
	  <ContributorsListing {...contributorListingState}
			       history={history}
			       id={this.props.id}
			       settings={workSettings}
			       onChange={onContributorChange}
			       onFetch={onContributorFetch} />
	</CardContent>
      ) : (null)}
      </Card>
	</div>
	</div>
    );
  }
}

export default PersonDetail;
