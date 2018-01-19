import React from 'react';
import { withStyles } from 'material-ui/styles';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { reduxForm } from 'redux-form'
import Button from 'material-ui/Button';
import List from 'material-ui/List';
import Divider from 'material-ui/Divider';
import { Link } from 'react-router-dom';
import AddIcon from 'material-ui-icons/Add';

import PersonForm from './forms/PersonForm';
import AccountsForm from './forms/AccountsForm';
import MembershipsForm from './forms/MembershipsForm';


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
@reduxForm({form: 'person'})
class PersonDetail extends React.Component {


    componentWillMount(){
       if (this.props.id !== 'add'){
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
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography type="headline" color="inherit" noWrap className={classes.headerText}>
              {(record || {}).name || 'New Person'}
            </Typography>
        </Toolbar>
        </AppBar>
        <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
        <Card className={classes.editorCard}>
          <CardContent className={classes.noPadding}>
            <List className={classes.noPadding} dense={true}>
              <PersonForm open={openedAccordion === 'person' || openedAccordion === undefined}
                          name="person"
                          errors={submittedErrors}
                          onAccordionClicked={this.handleAccordionClicked('person')}/>
              <Divider />
              <AccountsForm open={openedAccordion === 'account'}
                            name="account"
                            errors={submittedErrors}
                            typeOptions={settings.account_types}
                            onAccordionClicked={this.handleAccordionClicked('account')}/>
              <Divider />
              <MembershipsForm open={openedAccordion === 'memberships'}
                               name="memberships"
                               errors={submittedErrors}
                               record={record}
                               typeOptions={[]}
                               onAccordionClicked={this.handleAccordionClicked('memberships')}/>
             </List>
          </CardContent>
        <CardActions>
          <Button type="submit" color="primary">
              Update
          </Button>
      <div className={classes.fabButtonRight}>
        <Button fab color="primary" aria-label="add" to={'/record/person/add'} component={Link} >
          <AddIcon />
        </Button>
      </div>
        </CardActions>
        </Card>

        </form>

      </div>
    );
  }
}

export default PersonDetail;
