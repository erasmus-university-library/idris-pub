import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import { SortableHandle } from 'react-sortable-hoc';

import Avatar from '@material-ui/core/Avatar';
import BookIcon from '@material-ui/icons/Book';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import Chip from '@material-ui/core/Chip';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText  from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MessageIcon from '@material-ui/icons/Message';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import UnfoldMoreIcon from '@material-ui/icons/UnfoldMore';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import ShoppingBasketIcon from '@material-ui/icons/ShoppingBasket';
import WarningIcon from '@material-ui/icons/Warning';

import Citation from './widgets/Citation';
import ExternalLink from './widgets/ExternalLink';

import IdrisSDK from '../sdk.js';
const sdk = new IdrisSDK();

const styles = theme => ({
  optionsButton: {
    color:'#bdbdbd'
  },
  moduleItem: {
    marginTop: '16px',
  },
  RoyaltyAmmountAvatarBig: {
    fontSize: '0.9rem'
  },
  RoyaltyAmmountAvatar: {
    fontSize: '0.75rem'
  },
  RoyaltyAmmountAvatarSmall: {
    fontSize: '0.65rem'
  },
  RoyaltyAmmountAvatarWarning: {
    fontSize: '0.9rem',
    backgroundColor: '#B00020'
  },
  RoyaltyInfo: {
    fontSize: '0.75rem',
    lineHeight: 0,
    color:'#bdbdbd',
    display:'flex'
  }
});


const DragHandle = SortableHandle(() => (
  <Avatar style={{cursor: 'ns-resize'}}>
      <UnfoldMoreIcon />
  </Avatar>));

@withStyles(styles)
export class CourseLiteratureRoyaltyAvatar extends Component {
  render(){
    const { warning_message, tariff, tariff_message, excempt_message, cost, classes } = this.props;
    let ammount = `€ ${(cost/100).toFixed(2)}`;
    let ammountStyle =  ammount.length > 6 ?
	  classes.RoyaltyAmmountAvatarSmall : classes.RoyaltyAmmountAvatar;
    if (cost === 0){
      ammount = '€ 0';
      ammountStyle = classes.RoyaltyAmmountAvatarBig;
    }


    if ((warning_message || null) === null){
      return (
	<Tooltip title={tariff === 'excempt' ? `${tariff_message}: ${excempt_message}`: tariff_message}>
	  <Avatar className={ammountStyle}>{ammount}</Avatar>
	</Tooltip>)
    } else {
      return (
	<Tooltip title={warning_message}>
	  <Avatar className={classes.RoyaltyAmmountAvatarWarning}>
	    {`€ ?`}
	  </Avatar>
	</Tooltip>)
    }
  }
}

@withStyles(styles)
export class CourseLiteratureDownloadCounter extends Component {
  render(){
    const { unique_downloads, classes } = this.props;
      return (
	<Tooltip title="Downloads from unique students in last 30 days">
	  <Avatar>{(unique_downloads || 0).toString()}</Avatar>
	</Tooltip>
      )
  }
}


@withStyles(styles)
export class CourseLiteratureInfoIcon extends Component {
  render(){
    const { warning_message, tariff, tariff_message, excempt_message, cost, cost_message, classes } = this.props;
    let ammount = `€ ${(cost/100).toFixed(2)}`;

    let colorStyle = cost > 0 ? {color:'#B00020'} : {};
    if ((warning_message || null) === null){

      return (<div className={classes.RoyaltyInfo} style={colorStyle}>
	      {cost > 0 ?
	       <ShoppingBasketIcon style={{width:'0.75em', height:'0.75em'}}/>
	       :
	       <VerifiedUserIcon style={{width:'0.75em', height:'0.75em'}}/>}
	      <Typography gutterBottom color="inherit">
	      {tariff === 'excempt' ? `${tariff_message}: ${excempt_message}`: tariff_message}
	      {cost > 0 ? `: pay ${ammount} per student`: null}
	      </Typography>
	      </div>);
    } else {
      return (<div className={classes.RoyaltyInfo} style={{color:'#B00020'}}>
	      <WarningIcon style={{width:'0.75em', height:'0.75em'}}/>
	      <Typography gutterBottom color="inherit">
	      {warning_message}
	      </Typography>
	      </div>);
    }
  }
}


@withStyles(styles)
class CourseLiteratureItem extends Component {

  state = {optionsAnchorEl: null};

  shouldComponentUpdate(nextProps, nextState){
    if (
        nextProps.id === this.props.id &&
	nextProps.draggable == this.props.draggable &&
	nextProps.comment === this.props.comment &&
	nextProps.module === this.props.module &&
	(nextProps.royalties || {}).cost ===  (this.props.royalties || {}).cost &&
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
    this.props.onStartDrag(this.props.id);
  }

  handleRemove = () => {
    this.closeOptionsMenu();
    this.props.onRemove(this.props.tocId);

  }

  handleEdit = () => {
    this.closeOptionsMenu();
    this.props.onEdit(this.props.tocId);

  }


  render() {
    const { classes, id, comment, module, tocItem, draggable, courseId, isStudent } = this.props;
    const royalties = tocItem.royalties || null;
    const { optionsAnchorEl } = this.state;
    const resultEl = [];


    if (id) {
      resultEl.push(
	<ListItem key={id}
		  button
		  to={sdk.courseMaterialURL(courseId, id)}
		  component={ExternalLink}>
	  <ListItemIcon>
	    { isStudent ?
	      <BookmarkBorderIcon /> :
	      <CourseLiteratureDownloadCounter unique_downloads={tocItem.downloaded} /> }
	  </ListItemIcon>
  	  <ListItemText  inset
			 primary={[
			     <Citation citation={tocItem} key={0} />,
			    isStudent ? null : <CourseLiteratureInfoIcon {...royalties} key={1} />
			     ]}
			 secondary={comment}/>
	  { isStudent ? null :
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
 	      <MenuItem onClick={this.handleEdit}>
		<ListItemIcon>
		  <EditIcon />
		</ListItemIcon> Edit
	      </MenuItem>
 	      <MenuItem onClick={this.handleRemove}>
		<ListItemIcon>
		  <DeleteIcon />
		</ListItemIcon> Remove
	      </MenuItem>
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
	  }
	</ListItem>
      );
      //resultEl.push(<Divider inset key={`${id}-divider`} component="li" />);

    } else if (module){
      resultEl.push(
	<ListItem key={module} className={classes.moduleItem}>
	  <ListItemIcon><BookIcon /></ListItemIcon>
  	  <ListItemText primary={<Typography variant="headline">{module}</Typography>}
	                secondary={comment} />
	  { isStudent ? null :
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
 	      <MenuItem onClick={this.handleRemove}>
		<ListItemIcon>
		  <DeleteIcon />
		</ListItemIcon> Remove
	      </MenuItem>
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
	  }
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
