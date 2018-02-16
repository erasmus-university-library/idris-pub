import React from 'react';
import { withStyles } from 'material-ui/styles';

import Card, { CardActions, CardContent } from 'material-ui/Card';
import { reduxForm } from 'redux-form'
import Button from 'material-ui/Button';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Tabs, { Tab } from 'material-ui/Tabs';
import GroupForm from './forms/GroupForm';
import SubGroupsForm from './forms/SubGroupsForm';
import AccountsForm from './forms/AccountsForm';
import MembersForm from './forms/MembersForm';

const styles = theme => ({
    flex: {
        flex: 1
    },
    headerText: {
        float: 'left'
    },
    fabButtonRight: {
        padding: theme.spacing.unit,
        display: 'flex',
        justifyContent: 'flex-end',
        flex: 1
    },
});


@withStyles(styles, { withTheme: true })
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
            settings, onMemberChange, onMemberFetch, onMemberSubmit, onMemberAdd,
            onSubgroupChange, onSubgroupFetch, subgroupListingState,
            memberListingState, history, currentTab } = this.props;
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
        <Tab label="Group Information" />
        <Tab label="Person Members" />
        <Tab label="Work Contributions" />
      </Tabs>

        {!currentTab? <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
        <Card className={classes.editorCard}>
          <CardContent className={classes.noPadding}>
            <List dense={true}>
              <GroupForm open={openedAccordion === 'group' || openedAccordion === undefined}
                          name="group"
                          errors={submittedErrors}
                          typeOptions={settings.type}
                          history={history}
                          onAccordionClicked={this.handleAccordionClicked('group')}/>
              <Divider />
              <AccountsForm open={openedAccordion === 'account'}
                            name="account"
                            errors={submittedErrors}
                            typeOptions={settings.account_types}
                            onAccordionClicked={this.handleAccordionClicked('account')}/>
              <Divider />
              <SubGroupsForm open={openedAccordion === 'subgroups'}
                            name="subgroups"
                            id={this.props.id}
                            history={history}
                            {...subgroupListingState}
                            onAccordionClicked={this.handleAccordionClicked('subgroups')}
                            onChange={onSubgroupChange}
                            onFetch={onSubgroupFetch} />
             </List>
          </CardContent>
        <CardActions>
          <Button type="submit" color="primary">
              Update
          </Button>
        </CardActions>
        </Card>
        </form>: null}
        {currentTab === 1?
              <MembersForm open={true}
                            name="members"
                            id={this.props.id}
                            history={history}
                            {...memberListingState}
                            onChange={onMemberChange}
                            onFetch={onMemberFetch}
                            onSubmit={onMemberSubmit}
                            onMemberAdd={onMemberAdd} />
        : null}
        </div>
    );
  }
}

export default GroupDetail;
