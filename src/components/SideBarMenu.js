import React, { Component } from 'react';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import PersonIcon from 'material-ui-icons/Person';
import GroupIcon from 'material-ui-icons/Group';
import FaceIcon from 'material-ui-icons/Face';

class SideBarMenu extends Component {

  handleTypeClicked = (type) => (event) => {
      this.props.onTypeClicked(type);
  }

  render() {
      if (!this.props.types) {
          return null;
      }
      let icons = {
          'person': <PersonIcon />,
          'group': <GroupIcon />,
          'user': <FaceIcon />
      };

      let listItems = this.props.types.map((type) =>
          <ListItem button key={type.id} onClick={this.handleTypeClicked(type)}>
            <ListItemIcon>{icons[type.id] || null}</ListItemIcon>
            <ListItemText primary={type.label} />
          </ListItem>);

      return <List>{listItems}</List>;
  }
}

export default SideBarMenu;
