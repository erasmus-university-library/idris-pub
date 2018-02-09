import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import { Field, FieldArray, Fields} from 'redux-form'
import IconButton from 'material-ui/IconButton';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import FaceIcon from 'material-ui-icons/Face';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';
import Badge from 'material-ui/Badge';

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';
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

    renderOwners = (owners) => {
        const { classes } = this.props;
        return (<div>
              <ul className={classes.noPadding}>
              {owners.fields.map((owner, ownerIndex) =>
           <li key={ownerIndex} className={classes.flexContainer}>
             <Fields names={[`${owner}.person_id`, `${owner}._person_name`]}
                    component={mappedRelationField}
                    placeholder="Owner of Person Record"
                    kind="person"
                    className={classes.flex}/>
             <span className={classes.gutter}> </span>
             <Fields names={[`${owner}.group_id`, `${owner}._group_name`]}
                    component={mappedRelationField}
                    placeholder="Owner of Group Record"
                    kind="group"
                    className={classes.flex}/>
             <IconButton aria-label="Delete" onClick={() => owners.fields.remove(ownerIndex)}><DeleteIcon /></IconButton>
           </li>)}
              </ul>
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="add" onClick={() => owners.fields.push({})} >
                <AddIcon /> Add Owner
              </Button>
              </div>
            </div>);

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
          <br />
          <FieldArray name="owns" component={this.renderOwners} />
        </CardContent>
      </Card>
          </Collapse>
</div>
      );
    }
}
export default UserForm;

