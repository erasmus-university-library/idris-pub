import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Chip from '@material-ui/core/Chip';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import styles from './forms/formStyles.js';

@withStyles(styles)
class RecordAccordion extends React.Component {
  render() {
    const {classes, open, errorCount, label, count, onClick, Icon} = this.props;
    return (
      <ExpansionPanel expanded={open} onChange={onClick}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
	  <ListItemIcon>{
	      errorCount > 0 ? (
		<Badge badgeContent={errorCount}
		       color="primary"
		       classes={{colorPrimary: classes.errorBGColor}}>
		  <Icon />
		</Badge>):<Icon />
	  }
      </ListItemIcon>
	<ListItemText primary={label} />
      {count?<Chip label={count} align="right" />:null}
        <div/>
      </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
        <CardContent>
      {this.props.children}
      </CardContent>
      </Card>
      </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default RecordAccordion;
