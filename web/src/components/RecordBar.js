import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';

import styles from './forms/formStyles.js';

@withStyles(styles)
class RecordBar extends React.Component {
  render() {
    const {classes, label, errorCount, Icon} = this.props;
    return (
      <AppBar position="static" color="default">
	<Toolbar className={classes.recordBar}>
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
	<IconButton>
	<MoreVertIcon />
      </IconButton>
      </Toolbar>
      </AppBar>
    );
  }
}

export default RecordBar;
