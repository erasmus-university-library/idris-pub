import React from 'react';
import { withStyles } from 'material-ui/styles';

import Card, { CardActions, CardContent } from 'material-ui/Card';
import { reduxForm } from 'redux-form'
import Button from 'material-ui/Button';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';

import UserForm from './forms/UserForm';
import OwnerForm from './forms/OwnerForm';

const styles = theme => ({
    headerText: {
        flex:1
    },
    fabButtonRight: {
        padding: theme.spacing.unit,
        display: 'flex',
        justifyContent: 'flex-end',
        flex: 1
    },
});


@withStyles(styles, { withTheme: true })
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
    const { classes, record, handleSubmit, openedAccordion, submittedErrors, settings } = this.props;
    if (parseInt(this.props.id, 10) > 0){
        if((record || {}).id !== parseInt(this.props.id, 10)){
            return null
        }
    }
    return (
      <div>
        <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
        <Card className={classes.editorCard}>
          <CardContent className={classes.noPadding}>
            <List className={classes.noPadding} dense={true}>
              <UserForm open={openedAccordion === 'user' || openedAccordion === undefined}
                          name="user"
                          errors={submittedErrors}
                          typeOptions={settings.type}
                          onAccordionClicked={this.handleAccordionClicked('user')}/>
              <Divider />
              <OwnerForm open={openedAccordion === 'owner' || openedAccordion === undefined}
                         name="owner"
                         errors={submittedErrors}
                         onAccordionClicked={this.handleAccordionClicked('owner')}/>
             </List>
          </CardContent>
        <CardActions>
          <Button type="submit" color="primary">
              Update
          </Button>
        </CardActions>
        </Card>

        </form>

      </div>
    );
  }
}

export default UserDetail;
