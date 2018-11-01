import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import { SortableHandle } from 'react-sortable-hoc';
import { Link } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import ListItemText  from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListSubheader from '@material-ui/core/ListSubheader';
import BookIcon from '@material-ui/icons/Book';
import EditIcon from '@material-ui/icons/Edit';
import MessageIcon from '@material-ui/icons/Message';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Citation from './widgets/Citation';

const styles = theme => ({
  optionsButton: {
    color:'#bdbdbd'
  },
  moduleItem: {
    marginTop: '16px',
  }
});


const DragHandle = SortableHandle(() => (
  <Avatar style={{cursor: 'ns-resize'}}>
      <UnfoldMoreIcon />
  </Avatar>));

@withStyles(styles)
class CourseLiteratureItem extends Component {

  state = {optionsAnchorEl: null,
	   draggable: false};

  shouldComponentUpdate(nextProps, nextState){
    if (nextProps.id === this.props.id &&
	nextProps.comment === this.props.comment &&
	nextProps.module === this.props.module &&
        this.state === nextState){
      return false;
    }
    return true;
  }

  openOptionsMenu = (e) => {
    this.setState({optionsAnchorEl: e.currentTarget})
  }

  closeOptionsMenu = () => {
    this.setState({optionsAnchorEl:null});
  }

  handleEditModuleName = (module) => () => {
    this.closeOptionsMenu();
    this.props.onEditModuleName(module);
  }

  handleEditComment = (module, id, comment) => () => {
    this.closeOptionsMenu();
    this.props.onEditComment(module, id, comment);
  }

  handleStartDrag = () => {
    this.closeOptionsMenu();
    this.setState({draggable: true});
  }


  render() {
    const { classes, id, comment, module, tocItem } = this.props;
    const { optionsAnchorEl, draggable } = this.state;
    const resultEl = [];
    if (id) {
      resultEl.push(
	<ListItem key={id} button to={`/work/${id}`} component={Link}>
	  <ListItemIcon><BookmarkBorderIcon /></ListItemIcon>
  	  <ListItemText  inset primary={<Citation citation={tocItem} />} secondary={comment}/>
 	  <ListItemSecondaryAction>
	  { draggable ?
	    <DragHandle/>
	      :<div>
  	    <IconButton aria-label="Options"
			aria-owns={optionsAnchorEl ? 'moduleOptionsMenu' : null}
			onClick={this.openOptionsMenu}
			aria-haspopup="true">
	      <MoreVertIcon className={classes.optionsButton}/>
	    </IconButton>
	    <Menu id="moduleOptionsMenu"
		  anchorEl={optionsAnchorEl}
		  onClose={this.closeOptionsMenu}
		  open={Boolean(optionsAnchorEl)} >
 	      <MenuItem onClick={this.handleEditComment(null, id, comment || null)}>
		<ListItemIcon>
		  <MessageIcon />
		</ListItemIcon> Add Comment
	      </MenuItem>
 	      <MenuItem onClick={this.handleStartDrag}>
		<ListItemIcon>
		  <UnfoldMoreIcon />
		</ListItemIcon> Change Position
	      </MenuItem>
	      </Menu>
	      </div>
	    }
	  </ListItemSecondaryAction>
	</ListItem>
      );
      //resultEl.push(<Divider inset key={`${id}-divider`} component="li" />);

    } else if (module){
      resultEl.push(
	<ListItem key={module} className={classes.moduleItem}>
	  <ListItemIcon><BookIcon /></ListItemIcon>
  	  <ListItemText primary={<Typography variant="headline">{module}</Typography>}
	                secondary={comment} />
	  <ListItemSecondaryAction>
	  { draggable ?
	    <DragHandle/>
	      :<div>
  	    <IconButton aria-label="Options"
			aria-owns={optionsAnchorEl ? 'moduleOptionsMenu' : null}
			onClick={this.openOptionsMenu}
			aria-haspopup="true">
	      <MoreVertIcon className={classes.optionsButton}/>
	    </IconButton>
	    <Menu id="moduleOptionsMenu"
		  anchorEl={optionsAnchorEl}
		  onClose={this.closeOptionsMenu}
		  open={Boolean(optionsAnchorEl)} >
	      <MenuItem onClick={this.handleEditModuleName(module)}>
		<ListItemIcon>
		  <EditIcon />
		</ListItemIcon> Edit Name
	      </MenuItem>
	      <MenuItem onClick={this.handleEditComment(module, null, comment || null)}>
		<ListItemIcon>
		  <MessageIcon />
		</ListItemIcon> Add Comment
	      </MenuItem>
 	      <MenuItem onClick={this.handleStartDrag}>
		<ListItemIcon>
		  <UnfoldMoreIcon />
		</ListItemIcon> Change Position
	      </MenuItem>
	      </Menu>
	    </div>}
	  </ListItemSecondaryAction>
 	</ListItem>
      )
    }
    else if (comment){
      resultEl.push(<ListSubheader key={comment}>{comment}</ListSubheader>);
    }
    return resultEl;
  }

}

export default CourseLiteratureItem;
