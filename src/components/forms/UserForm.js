import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'
import FaceIcon from '@material-ui/icons/Face';
import Badge from '@material-ui/core/Badge';
import { ListItemIcon, ListItemText } from '@material-ui/core/List';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from '@material-ui/core/ExpansionPanel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Card, { CardActions, CardContent } from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class UserForm extends React.Component {
    getErrorCount() {
        if (!this.props.errors){
            return 0
        }
        let errorCount = 0;
        for (const field of ['userid', 'user_group', 'credentials']){
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
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><FaceIcon /></Badge>: <FaceIcon />}</ListItemIcon>
              <ListItemText primary="User" />
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
          <CardContent>
           <div className={classes.formItem}>
             <Field name="user_group"
                    component={mappedSelect}
                    options={typeOptions}
                    label="Group"
                    className={classes.flex} />
           </div>
           <div className={classes.formItem}>
             <Field name="userid"
                    component={mappedTextField}
                    label="Account Name"
                    className={classes.flex}/>
             <Field name="credentials"
                    component={mappedTextField}
                    type="password"
                    label="Password"
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
export default UserForm;
