import React from 'react';

import { reduxForm } from 'redux-form'

import UserForm from './forms/UserForm';
import OwnerForm from './forms/OwnerForm';

@reduxForm({form: 'user'})
class UserDetail extends React.Component {


    componentWillMount(){
       if (this.props.id === 'add'){
           this.props.changeAppHeader('Add User');
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
    componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
           this.props.onFetch(nextProps.id);
        }
    }

  render() {
    const { record, handleSubmit, openedAccordion, submittedErrors, settings } = this.props;
    if (parseInt(this.props.id, 10) > 0){
        if((record || {}).id !== parseInt(this.props.id, 10)){
            return null
        }
    }
    return (
      <div>
        <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
        <UserForm open={openedAccordion === 'user' || openedAccordion === undefined}
                  name="user"
                  errors={submittedErrors}
                  typeOptions={settings.type}
                  onAccordionClicked={this.handleAccordionClicked('user')}/>
        <OwnerForm open={openedAccordion === 'owner'}
                   name="owner"
                   errors={submittedErrors}
                   onAccordionClicked={this.handleAccordionClicked('owner')}/>

        </form>
      </div>
    );
  }
}

export default UserDetail;
