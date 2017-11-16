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

import styles from './RecordTypesStyles.js'


@withStyles(styles, { withTheme: true })
class RecordTypes extends Component {

  handleTypeClicked = (type) => (event) => {
      this.props.recordTypeClick(type);
  }

  handleFilterClicked = (filter, filterValue) => (event) => {
      const selectedValues = [];
      for (const f of filter.values){
          if (f.isSelected && f.id !== filterValue){
              selectedValues.push(f.id);
          }
      };
      if (event.target.checked){
          selectedValues.push(filterValue);
      }
      this.props.recordTypeFilterUpdate(filter.id, selectedValues);
  }
  renderExpand = (type) => {
      if (!(type.filters && type.filters.length)){
          return null;
      } else if (type.filtersOpen) {
          return <ExpandMore />;
      } else {
          return <ExpandLess />;
      }
  }

  renderFilters = (props, type) => {
      const { classes } = props;


      if (type.filters.length === 0){
          return null;
      }

      let navFilters = type.filters.map((filter) => {
          let filterHeader = <ListSubheader>{filter.label}</ListSubheader>;
          let items = filter.values.map((filterValue) => <ListItem key={`${filter.id}-${filterValue.id}`}>
              <Checkbox checked={filterValue.isSelected}
                        tabIndex={-1}
                        disableRipple
                        onChange={this.handleFilterClicked(filter, filterValue.id)}
                        className={classes.checkBox}/>
              <ListItemText primary={filterValue.label}/>
              </ListItem>);
          return  <List className={classes.nested}
                        subheader={filterHeader}
                        key={filter.id} >{items}</List>

      });
      return (<Collapse in={type.filtersOpen} transitionDuration="auto" unmountOnExit>
                {navFilters}
              </Collapse>);

  }

  render() {
    const { types } = this.props;
      if (!this.props.types) {
          return null;
      }
      let icons = {
          'person': <PersonIcon />,
          'group': <GroupIcon />,
          'user': <FaceIcon />
      };

      let listItems = types.map((type) => <div key={type.id}>
          <ListItem button onClick={this.handleTypeClicked(type.id)}>
            <ListItemIcon>{icons[type.id] || null}</ListItemIcon>
            <ListItemText primary={type.label} />
            {this.renderExpand(type)}
          </ListItem>
          {this.renderFilters(this.props, type)}
          </div>
      );
      return <List subheader={<ListSubheader>Types</ListSubheader>} >{listItems}</List>;
  }
}

export default RecordTypes;
