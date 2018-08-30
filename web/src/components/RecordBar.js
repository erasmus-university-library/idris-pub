import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './forms/formStyles.js';

@withStyles(styles)
class RecordBar extends React.Component {
  state = {menuAnchorEl: null}

  toggleMenu = (event) => {
    this.setState({menuAnchorEl: event.currentTarget})
  }

  handleDelete = () => {
    this.setState({menuAnchorEl: null})
    this.props.onDelete()
  }

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
	<IconButton onClick={this.toggleMenu}
                    aria-owns="recordMenu">
	<MoreVertIcon />
	</IconButton>
      </Toolbar>
	<Menu id="recordMenu"
              anchorEl={this.state.menuAnchorEl}
              open={Boolean(this.state.menuAnchorEl)}>
	<MenuItem onClick={this.handleDelete}>Delete</MenuItem>
	</Menu>
      </AppBar>
    );
  }
}

export default RecordBar;
