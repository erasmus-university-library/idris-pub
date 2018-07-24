import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { reduxForm } from 'redux-form'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import WorkForm from './forms/WorkForm';
import ContributorsForm from './forms/ContributorsForm';
import RelationsForm from './forms/RelationsForm';
import DescriptionsForm from './forms/DescriptionsForm';
import IdentifiersForm from './forms/IdentifiersForm';
import MeasuresForm from './forms/MeasuresForm';
import RelationsListing from './forms/RelationsListing';


import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Zoom from '@material-ui/core/Zoom';

import AttachFileIcon from '@material-ui/icons/AttachFile';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import StyleIcon from '@material-ui/icons/Style';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import FormatQuoteIcon from '@material-ui/icons/FormatQuote';
import LanguageIcon from '@material-ui/icons/Language';
import SaveIcon from '@material-ui/icons/Save';
import FavoriteIcon from '@material-ui/icons/Favorite';

import RecordBar from './RecordBar.js';
import RecordSection from './RecordSection.js';

import styles from './forms/formStyles.js';


@withStyles(styles)
@reduxForm({form: 'work'})
class WorkDetail extends React.Component {
    componentDidMount(){
       if (this.props.id === 'add'){
           this.props.changeAppHeader('Add Work');
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


    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
            if (this.props.currentTab !== 0){
                this.props.onDetailChange({currentTab: 0});
            }
            this.props.onFetch(nextProps.id);
        }
    }

  getLabel(formValues) {
    let name = formValues.title;
    if (formValues.type){
      const typeLabel = (this.props.settings.type.filter((type) => (type.id === formValues.type? type.label : null))[0]||{}).label;
      name = `${name} (${typeLabel})`;
    }
    return name;
  }

  render() {
    const { classes, handleSubmit, submittedErrors,
            settings, history, currentTab, formValues,
            relationListingState, workSettings, onRelationChange, onRelationFetch } = this.props;
      if (formValues === undefined){
          return null;
      }

    const errors = submittedErrors || {};
    const label = this.getLabel(formValues);
    const errorCount = Object.values(errors).length;

    return (
      <div>
      <div className={classes.tabContent}>
	  <Card>
	    <RecordBar label={label} errorCount={errorCount} Icon={StyleIcon}/>
	    <Tabs value={currentTab || 0}
		  onChange={this.handleTabClicked}
		  indicatorColor="primary"
		  textColor="primary"
		  centered>
              <Tab label="Work Information" />
              <Tab label="Related Works" />
	    </Tabs>
	    {!currentTab? (
              <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
		<CardContent className={classes.cardContainer}>
		  <WorkForm name="work"
			    formValues={formValues}
			    errors={errors}
			    settings={settings}
			    history={history} />
		  <div className={classes.recordAccordions}>
		    <RecordSection label="Contributors"
				   errors={errors}
				   name="contributors"
				   settings={settings}
				   Icon={FavoriteIcon}
				   Form={ContributorsForm}
				   fieldLabels = {(value) => ([(settings.contributor_role.filter((type) => (type.id === value.role? type.label : null))[0]||{}).label||null, value._person_name])} />
		    <RecordSection label="Relations"
				   errors={errors}
				   name="relations"
				   settings={settings}
				   Icon={LanguageIcon}
				   Form={RelationsForm}
				   fieldLabels = {(value) => ([(settings.relation_types.filter((type) => (type.id === value.type? type.label : null))[0]||{}).label||null, value._target_name])} />
		    <RecordSection label="Identifiers"
				   errors={errors}
				   name="identifiers"
				   settings={settings}
				   Icon={FingerprintIcon}
				   Form={IdentifiersForm}
				   fieldLabels = {(value) => ([(settings.identifier_types.filter((type) => (type.id === value.type? type.label : null))[0]||{}).label||null, value.value])} />
		    <RecordSection label="Descriptions"
				   errors={errors}
				   name="descriptions"
				   settings={settings}
				   Icon={FormatQuoteIcon}
				   Form={DescriptionsForm}
				   fieldLabels = {(value) => ([(settings.description_types.filter((type) => (type.id === value.type? type.label : null))[0]||{}).label||null, value.value])} />
		      <RecordSection label="Topics"
				     errors={errors}
				     name="topics"
				     settings={settings}
				     Icon={BubbleChartIcon}
				     Form={null}
				     fieldLabels = {(value) => (null)} />
		      <RecordSection label="Measures"
				   errors={errors}
				   name="measures"
				   settings={settings}
				   Icon={NetworkCheckIcon}
				   Form={MeasuresForm}
				   fieldLabels = {(value) => ([(settings.measure_types.filter((type) => (type.id === value.type? type.label : null))[0]||{}).label||null, value.value])} />
		      <RecordSection label="Expressions / Attachments"
				     errors={errors}
				     name="expressions"
				     settings={settings}
				     Icon={AttachFileIcon}
				     Form={null}
				     fieldLabels = {(value) => (null)} />
		  </div>
		</CardContent>
		<CardActions>
		  <Zoom in={true} className={classes.SaveButton}>
		  <Button variant="fab" type="submit" color="primary">
		    <SaveIcon />
		  </Button>
		  </Zoom>
		</CardActions>
	      </form>
	    ): (null)}
      {currentTab === 1 ? (
	<CardContent>
	  <RelationsListing {...relationListingState}
			    history={history}
			    id={this.props.id}
			    settings={workSettings}
			    onChange={onRelationChange}
			    onFetch={onRelationFetch} />
	</CardContent>
      ) : (null)}
      </Card>
      </div>
      </div>);
  }
}

export default WorkDetail;
