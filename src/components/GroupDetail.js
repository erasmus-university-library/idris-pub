import React from 'react';

import { reduxForm } from 'redux-form'
import Tabs, { Tab } from 'material-ui/Tabs';
import GroupForm from './forms/GroupForm';
import SubGroupsForm from './forms/SubGroupsForm';
import AccountsForm from './forms/AccountsForm';
import MembersForm from './forms/MembersForm';

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
    const { record, handleSubmit, openedAccordion, submittedErrors,
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
        <Tab label="Members" />
        <Tab label="Affiliated Works" />
      </Tabs>

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
                          typeOptions={settings.account_types}
                          onAccordionClicked={this.handleAccordionClicked('account')}/>
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
