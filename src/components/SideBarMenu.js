import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import PersonIcon from 'material-ui-icons/Person';
import GroupIcon from 'material-ui-icons/Group';
import FaceIcon from 'material-ui-icons/Face';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';
import ListSubheader from 'material-ui/List/ListSubheader';
import Checkbox from 'material-ui/Checkbox';

import styles from './SideBarMenuStyles.js'


@withStyles(styles, { withTheme: true })
class SideBarMenu extends Component {

  handleTypeClicked = (type) => (event) => {
      this.props.onTypeClicked(type);
  }



  renderExpand = (type) => {
      let filter_open = true;
      if (!(type.filters && type.filters.length)){
          return null;
      } else if (filter_open) {
          return <ExpandMore />;
      } else {
          return <ExpandLess />;
      }
  }

  renderFilters = (filters, classes) => {
      if (filters.length === 0){
          return null;
      }
      return filters.map((filter) => {
          let filter_open = true;
          let filter_header = <ListSubheader>{filter.label}</ListSubheader>;
          let items = filter.types.map((type) => <ListItem key={`filter-${type.id}`}
              button >
              <Checkbox checked={false} tabIndex={-1} disableRipple className={classes.checkBox}/>
              <ListItemText primary={type.label} />
              </ListItem>);

          return  <Collapse in={filter_open} transitionDuration="auto" unmountOnExit>
          <List className={classes.nested} subheader={filter_header} >{items}</List>
              </Collapse>
      });
  }

  render() {
    const { classes } = this.props;
      if (!this.props.types) {
          return null;
      }
      let icons = {
          'person': <PersonIcon />,
          'group': <GroupIcon />,
          'user': <FaceIcon />
      };

      let listItems = this.props.types.map((type) => <div key={type.id}>
          <ListItem button onClick={this.handleTypeClicked(type.id)}>
            <ListItemIcon>{icons[type.id] || null}</ListItemIcon>
            <ListItemText primary={type.label} />
            {this.renderExpand(type)}
          </ListItem>
          {this.renderFilters(type.filters, classes)}
          </div>
      );
      return <List subheader={<ListSubheader>Types</ListSubheader>} >{listItems}</List>;
  }
}

export default SideBarMenu;
