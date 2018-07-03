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
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import PersonIcon from '@material-ui/icons/Person';
import Badge from '@material-ui/core/Badge';

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
    if (!errors){
      return 0
    }
    let errorCount = 0;
    for (const field of ['family_name', 'initials', 'given_name',
                         'family_name_prefix', 'alternative_name']){
      if (errors[field] !== undefined){
        errorCount += 1;
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
	    <AppBar position="static" color="default">
	      <Toolbar className={classes.recordBar}>
		<ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount}
							  color="primary"
							  classes={{colorPrimary: classes.errorBGColor}}>
		    <PersonIcon /></Badge>: <PersonIcon />}</ListItemIcon>
		<ListItemText primary={label} />
		<IconButton>
		   <MoreVertIcon />
		</IconButton>
	      </Toolbar>
	    </AppBar>
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
			  </div>
		    </CardContent>
		    <CardActions>
			<Button type="submit" color="primary">
			    Update
			  </Button>
		      </CardActions>
	      </form>: null}
              {currentTab === 1?
		<CardContent>
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
