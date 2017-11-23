import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import { Field } from 'redux-form'
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import PersonIcon from 'material-ui-icons/Person';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';
import Badge from 'material-ui/Badge';

import { mappedTextField } from '../widgets/mapping.js';
import styles from '../EditorStyles.js';

@withStyles(styles, { withTheme: true })
class PersonForm extends React.Component {
    getErrorCount() {
        if (!this.props.errors){
            return 0
        }
        let errorCount = 0;
        for (const field of ['family_name', 'initials', 'given_name', 'family_name_prefix']){
            if (this.props.errors[field] !== undefined){
                errorCount += 1;
            }
        }
        return errorCount
    }

    render(){
      const { classes, onAccordionClicked, open } = this.props;
      const errorCount = this.getErrorCount();

      return (<div><ListItem button onClick={onAccordionClicked}>
            <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><PersonIcon /></Badge>: <PersonIcon />}</ListItemIcon>
            <ListItemText primary="Person" />
            <ListItemIcon>{open ? <ExpandLess />: <ExpandMore />}</ListItemIcon>
          </ListItem>
          <Collapse in={open} transitionDuration="auto" unmountOnExit>
          <Card>
          <CardContent className={classes.accordionCard}>
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
        </CardContent>
      </Card>
          </Collapse>
</div>
      );
    }
}
export default PersonForm;

