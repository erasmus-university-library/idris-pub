import React from 'react';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { Field, reduxForm } from 'redux-form'
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';

import styles from './EditorStyles.js';

@withStyles(styles, { withTheme: true })
@reduxForm({form: 'person'})
class PersonEditor extends React.Component {

    renderMaterialUI({input, label, className, meta}){
    return <TextField label={meta.error || label}
                      error={meta.invalid}
                      id={input.name}
                      value={input.value}
                      onChange={input.onChange}
                      className={className}/>
    }

  handleSubmit = (values) => {
      return this.props.submitRecord(this.props.type,
                                     this.props.id,
                                     values);
  }

  render() {
      const { classes, record, closeDetailBar, handleSubmit } = this.props;
    return (
      <div>
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography type="headline" color="inherit" noWrap className={classes.flex}>
              {record.name}
            </Typography>
            <IconButton onClick={closeDetailBar}>
               <ChevronRightIcon />
            </IconButton>
        </Toolbar>
        </AppBar>
        <form onSubmit={ handleSubmit(this.handleSubmit) } noValidate autoComplete="off">
        <Card className={classes.card}>
          <CardContent>
           <div className={classes.flexContainer}>
             <Field name="family_name" component={this.renderMaterialUI} label="Family Name" className={classes.flex}/>
             <span className={classes.gutter}> </span>
             <Field name="family_name_prefix" component={this.renderMaterialUI} label="Family Name Prefix"/>
           </div>
           <div className={classes.flexContainer}>
             <Field name="given_name" component={this.renderMaterialUI} className={classes.flex} label="Given Name"/>
             <span className={classes.gutter}> </span>
             <Field name="initials" component={this.renderMaterialUI} label="Initials"/>
           </div>
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

export default PersonEditor;
