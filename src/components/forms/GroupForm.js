import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Field, Fields } from 'redux-form'
import { ListItemIcon, ListItemText } from 'material-ui/List';
import GroupIcon from 'material-ui-icons/Group';
import Badge from 'material-ui/Badge';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import Button from 'material-ui/Button';

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';

import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class GroupForm extends React.Component {
    getErrorCount() {
        if (!this.props.errors){
            return 0
        }
        let errorCount = 0;
        for (const field of ['international_name', 'native_name', 'abbreviated_name', 'type']){
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
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><GroupIcon /></Badge>: <GroupIcon />}</ListItemIcon>
              <ListItemText primary="Group" />
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Card className={classes.editorCard}>
          <CardContent>
           <div className={classes.flexContainer}>
             <Field name="type" component={mappedSelect} options={typeOptions} label="Type" className={classes.flex}/>
           </div>
           <div className={classes.flexContainer}>
             <Field name="international_name" component={mappedTextField} label="International Name" className={classes.flex}/>
           </div>
           <div className={classes.flexContainer}>
             <Field name="native_name" component={mappedTextField} label="Native Name" className={classes.flex}/>
             <span className={classes.gutter}> </span>
             <Field name="abbreviated_name" component={mappedTextField} label="Abbreviated Name" className={classes.flex}/>
           </div>
           <div className={classes.flexContainer}>
             <Fields names={['parent_id', '_parent_name']}
                    component={mappedRelationField}
                    placeholder="Part of parent Group"
                    kind="group"
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
export default GroupForm;

