import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Field, Fields, FieldArray } from 'redux-form'
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import CardMembershipIcon from 'material-ui-icons/CardMembership';
import Badge from 'material-ui/Badge';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardActions, CardContent } from 'material-ui/Card';

import { mappedTextField, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class MembershipsForm extends React.Component {
    getErrorCount(errors) {
        if (!errors || !errors.accounts){
            return 0
        }
        let errorCount = 0;
        for (const error of Object.values(errors.accounts)){
          for (const field of ['group_id', 'start_date', 'end_date']){
              if (error[field] !== undefined){
                errorCount += 1;
              }
          }
        }
        return errorCount
    }

    getYearRange(memberships){
        let firstYear = null;
        let lastYear = null;
        let year;
        for (const member of Object.values(memberships)){
            console.log(member);
            if ((member.start_date || null) !== null){
                year = parseFloat(member.start_date.substr(0, 4));
                if (firstYear === null || year < firstYear){
                    firstYear = year;
                }
            }
            if ((member.end_date || null) !== null){
                year = parseFloat(member.end_date.substr(0, 4));
                if (lastYear === null || year > lastYear){
                    lastYear = year;
                }
            }
        }

        return {firstYear, lastYear};
    }

    renderMemberships = (memberships) => {
        const { classes } = this.props;
        return (<div>
              {memberships.fields.map((membership, membershipIndex) =>
           <div key={membershipIndex} className={classes.formItem}>
             <Fields names={[`${membership}.group_id`, `${membership}._group_name`]}
                    component={mappedRelationField}
                    placeholder="Group"
                    kind="group"
                    className={classes.flex}/>
             <span className={classes.gutter}> </span>
             <Field name={`${membership}.start_date`}
                    component={mappedTextField}
                    label="Start Date"
                    type="date"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${membership}.end_date`}
                    component={mappedTextField}
                    label="End Date"
                    type="date"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
             <IconButton aria-label="Delete" onClick={() => memberships.fields.remove(membershipIndex)}><DeleteIcon /></IconButton>
           </div>)}
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="add" onClick={() => memberships.fields.push({})} >
                <AddIcon /> Add Membership
              </Button>
              </div>
          </div>);

    }


    render(){
        const { classes, onAccordionClicked, open } = this.props;
        const errorCount = this.getErrorCount(this.props.errors);
        return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><CardMembershipIcon /></Badge>: <CardMembershipIcon />}</ListItemIcon>
              <ListItemText primary="Memberships" />
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
          <CardContent>
          <FieldArray name="memberships" component={this.renderMemberships} />
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
export default MembershipsForm;
