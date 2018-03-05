import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Field } from 'redux-form'
import { ListItemIcon, ListItemText } from 'material-ui/List';
import StyleIcon from 'material-ui-icons/Style';
import Badge from 'material-ui/Badge';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';

import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class WorkForm extends React.Component {
    getErrorCount() {
        if (!this.props.errors){
            return 0
        }
        let errorCount = 0;
        for (const field of ['title', 'issued', 'type']){
            if (this.props.errors[field] !== undefined){
                errorCount += 1;
            }
        }
        return errorCount
    }

    render(){
      const { classes, onAccordionClicked, open, typeOptions } = this.props;
      const errorCount = this.getErrorCount();

      return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><StyleIcon /></Badge>: <StyleIcon />}</ListItemIcon>
              <ListItemText primary="Work" />
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
          <CardContent>
           <div className={classes.formItem}>
             <Field name="title" component={mappedTextField} label="Title" multiline rowsMax="4" className={classes.flex}/>
           </div>
           <div className={classes.formItem}>
             <Field name="type" component={mappedSelect} options={typeOptions} label="Type" className={classes.flex}/>
             <span className={classes.gutter}> </span>
             <Field name="issued" component={mappedTextField} label="Issued Date" type="date" className={classes.dateField} />
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
export default WorkForm;

