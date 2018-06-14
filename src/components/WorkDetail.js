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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import AttachFileIcon from '@material-ui/icons/AttachFile';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';


const styles = theme => ({
  tabContent: {
      margin: theme.spacing.unit * 2
  }
});

@withStyles(styles)
@reduxForm({form: 'work'})
class WorkDetail extends React.Component {
    componentWillMount(){
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


    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
            if (this.props.currentTab !== 0){
                this.props.onDetailChange({currentTab: 0});
            }
            this.props.onFetch(nextProps.id);
        }
    }

  render() {
    const { classes, handleSubmit, openedAccordion, submittedErrors,
            settings, history, currentTab, formActions, formValues,
            relationListingState, workSettings, onRelationChange, onRelationFetch } = this.props;
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
        <Tab label="Work Information" />
        <Tab label="Related Works" />
      </Tabs>
      <div className={classes.tabContent}>
        {!currentTab?
         <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
            <WorkForm open={openedAccordion === 'work' || openedAccordion === undefined}
                       name="work"
                       formValues={formValues}
                       errors={submittedErrors}
                       typeOptions={settings.type}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('work')}/>

            <ContributorsForm open={openedAccordion === 'contributors'}
                       name="contributors"
                       errors={submittedErrors}
                       formValues={formValues.contributors}
                       workDateIssued={formValues.issued}
                       formActions={formActions}
                       contributorOptions={settings.contributor_role}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('contributors')}/>

            <RelationsForm open={openedAccordion === 'relations'}
                       name="relations"
                       errors={submittedErrors}
                       formValues={formValues.relations}
                       formActions={formActions}
                       relationOptions={settings.relation_types}
                       typeOptions={settings.type}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('relations')}/>


            <DescriptionsForm open={openedAccordion === 'descriptions'}
                       name="descriptions"
                       errors={submittedErrors}
                       formValues={formValues.descriptions}
                       formActions={formActions}
                       descriptionTypeOptions={settings.description_types}
                       descriptionFormatOptions={settings.description_formats}
                       typeOptions={settings.type}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('descriptions')}/>

            <IdentifiersForm open={openedAccordion === 'identifiers'}
                       name="identifiers"
                       errors={submittedErrors}
                       formValues={formValues.identifiers}
                       typeOptions={settings.identifier_types}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('identifiers')}/>

          <ExpansionPanel expanded={openedAccordion === 'topics'}
                          onChange={this.handleAccordionClicked('topics')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon><BubbleChartIcon /></ListItemIcon>
              <ListItemText primary="Topics" />
          </ExpansionPanelSummary>
          </ExpansionPanel>

            <MeasuresForm open={openedAccordion === 'measures'}
                          name="measures"
                          errors={submittedErrors}
                          typeOptions={settings.measure_types}
                          formValues={formValues.measures}
                          history={history}
                          onAccordionClicked={this.handleAccordionClicked('measures')}/>


          <ExpansionPanel expanded={openedAccordion === 'expressions'}
                          onChange={this.handleAccordionClicked('expressions')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon><AttachFileIcon /></ListItemIcon>
              <ListItemText primary="Expressions / Attachments" />
          </ExpansionPanelSummary>
          </ExpansionPanel>

        </form>: null}
        {currentTab === 1?
           <RelationsListing {...relationListingState}
                                history={history}
                                id={this.props.id}
                                settings={workSettings}
                                onChange={onRelationChange}
                                onFetch={onRelationFetch} />
         : null}
        </div>
        </div>
    );
  }
}

export default WorkDetail;
