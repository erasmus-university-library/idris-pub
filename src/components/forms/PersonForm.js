import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Field } from 'redux-form'
import { ListItemIcon, ListItemText } from 'material-ui/List';
import PersonIcon from 'material-ui-icons/Person';
import Badge from 'material-ui/Badge';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';

import { mappedTextField } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class PersonForm extends React.Component {
    getErrorCount() {
        if (!this.props.errors){
            return 0
        }
        let errorCount = 0;
        for (const field of ['family_name', 'initials', 'given_name',
                             'family_name_prefix', 'alternative_name']){
            if (this.props.errors[field] !== undefined){
                errorCount += 1;
            }
        }
        return errorCount
    }

    render(){
      const { classes, onAccordionClicked, open } = this.props;
      const errorCount = this.getErrorCount();

      return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><PersonIcon /></Badge>: <PersonIcon />}</ListItemIcon>
              <ListItemText primary="Person" />
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Card className={classes.editorCard}>
          <CardContent>
           <div className={classes.flexContainer}>
             <Field name="family_name" component={mappedTextField} label="Family Name" className={classes.flex}/>
             <span className={classes.gutter}> </span>
             <Field name="family_name_prefix" component={mappedTextField} label="Family Name Prefix"/>
           </div>
           <div className={classes.flexContainer}>
             <Field name="given_name" component={mappedTextField} className={classes.flex} label="Given Name"/>
             <span className={classes.gutter}> </span>
             <Field name="initials" component={mappedTextField} label="Initials"/>
           </div>
           <div className={classes.flexContainer}>
             <Field name="alternative_name"
                    component={mappedTextField}
                    multiline
                    label="Alternative Name(s)"
                    className={classes.flex}/>
           </div>
        </CardContent>
          <CardActions>
          <Button type="submit" color="primary">
          Update
          </Button>
          </CardActions>
          </Card>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      );
    }
}
export default PersonForm;

