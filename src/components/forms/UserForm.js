import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import { Field } from 'redux-form'
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import FaceIcon from 'material-ui-icons/Face';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';
import Badge from 'material-ui/Badge';

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

      return (<div><ListItem button onClick={onAccordionClicked}>
            <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><FaceIcon /></Badge>: <FaceIcon />}</ListItemIcon>
            <ListItemText primary="User" />
            <ListItemIcon>{open ? <ExpandLess />: <ExpandMore />}</ListItemIcon>
          </ListItem>
          <Collapse in={open} unmountOnExit>
          <Card>
          <CardContent className={classes.accordionCard}>
           <div className={classes.flexContainer}>
             <Field name="user_group" component={mappedSelect} options={typeOptions} label="Group" className={classes.flex}/>
           </div>
           <div className={classes.flexContainer}>
             <Field name="userid" component={mappedTextField} label="Account Name" className={classes.flex}/>
             <Field name="credentials"
                    component={mappedTextField}
                    type="password"
                    label="Password"
                    className={classes.flex}/>
           </div>
        </CardContent>
      </Card>
          </Collapse>
</div>
      );
    }
}
export default UserForm;

