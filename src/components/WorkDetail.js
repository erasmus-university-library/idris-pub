import React from 'react';
import { withStyles } from 'material-ui/styles';

import { reduxForm } from 'redux-form'
import Tabs, { Tab } from 'material-ui/Tabs';
import WorkForm from './forms/WorkForm';

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
            settings, history, currentTab } = this.props;
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
        <Tab label="Work Information" />
        <Tab label="Aggregated Works" />
      </Tabs>
      <div className={classes.tabContent}>
        {!currentTab?
         <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
            <WorkForm open={openedAccordion === 'work' || openedAccordion === undefined}
                       name="work"
                       errors={submittedErrors}
                       typeOptions={settings.type}
                       history={history}
                       onAccordionClicked={this.handleAccordionClicked('work')}/>
        </form>: null}
        </div>
        </div>
    );
  }
}

export default WorkDetail;
