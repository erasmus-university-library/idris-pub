import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import CardMembershipIcon from 'material-ui-icons/CardMembership';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';

import MembershipList from '../MembershipList';
import styles from '../EditorStyles.js';

@withStyles(styles, { withTheme: true })
class MembersForm extends React.Component {

    render(){
        const { classes, onAccordionClicked, open } = this.props;

        return (<div><ListItem button onClick={onAccordionClicked}>
            <ListItemIcon><CardMembershipIcon /></ListItemIcon>
            <ListItemText primary="Members" />
            <ListItemIcon>{open ? <ExpandLess />: <ExpandMore />}</ListItemIcon>
          </ListItem>
          <Collapse in={open} transitionDuration="auto" unmountOnExit>
          <Card>
          <CardContent className={classes.accordionCard}>
            <MembershipList />
        </CardContent>
        </Card>
        </Collapse>
          </div>);
    }
}
export default MembersForm;
