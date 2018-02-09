import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import SearchIcon from 'material-ui-icons/Search';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';

const styles = theme => ({
  formControl: {
    width: '100%',
  },
  formControlSelect: {
      minWidth: 200,
      maxWidth: 350,
  },
  table: {
      marginTop: theme.spacing.unit
  },
  fabButtonRight: {
      padding: theme.spacing.unit,
      display: 'flex',
      justifyContent: 'flex-end',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
});

@withStyles(styles)
class GroupListing extends Component {

    handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/group/${record.id}`);
        this.props.onChange({selected: record.id});
    }
    handleQueryChange = (event) => {
        this.props.onChange({query: event.target.value, offset: 0});
    }
    handleTypeChange = (event) => {
        this.props.onChange({filter_type: event.target.value, offset: 0});
    }

    handlePageChange = (event, page) => {
        this.props.onChange({offset: page * (this.props.limit || 10)});
    }


    handleRowsPerPageChange = event => {
      this.props.onChange({offset: 0, limit: event.target.value});
    };

    componentWillMount(){
      if (this.props.offset === undefined){
          // first run
          this.props.onChange({offset: 0});
      }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.query !== this.props.query ||
            nextProps.filter_type !== this.props.filter_type ||
            nextProps.offset !== this.props.offset ||
            nextProps.limit !== this.props.limit){
            // a fetch is needed
          if (this.timeoutId){
              // a fetch is in already scheduled with a timeout, cancel it
              clearTimeout(this.timeoutId);
          }
          const filters = {};
          if (nextProps.filter_type){
              filters.filter_type = nextProps.filter_type
          };

          const fetchCallBack = () => {
              this.props.onFetch(nextProps.query,
                                 filters,
                                 nextProps.offset,
                                 nextProps.limit);
          };
          if (nextProps.query !== this.props.query){
              // fetch after the timeout has passed
              this.timeoutId = setTimeout(fetchCallBack, 200);
          } else {
              fetchCallBack();
          }

      }
    }

    render(){
        const { settings, classes, query, filter_type, total, limit, offset, records } = this.props;
      return (
        <div>
        <Paper>
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">Search Groups</InputLabel>
              <Input
                id="search"
                type="text"
                value={query || ''}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
              />
              </FormControl>
        <FormControl className={classes.formControlSelect}>
          <InputLabel htmlFor="age-simple">Group Type</InputLabel>
          <Select
            value={filter_type || ''}
            onChange={this.handleTypeChange}
            inputProps={{
              name: 'group_type',
              id: 'group-type',
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {settings.type.map(groupType => (
            <MenuItem value={groupType.id}>{groupType.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
            </Toolbar>
          </AppBar>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell numeric>Members</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(records || []).map(record => (
              <TableRow key={record.id}
                        selected={record.id === this.props.selected}
                        onClick={this.handleRowClick(record)}
                        hover>
                <TableCell>{record.name}</TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell numeric>{record.members}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={total || 0}
              rowsPerPage={limit || 10}
              page={(offset || 0) / (limit || 10)}
              onChangePage={this.handlePageChange}
              onChangeRowsPerPage={this.handleRowsPerPageChange}>
          </TablePagination>
          </TableRow>
        </TableFooter>
      </Table>
      <div className={classes.fabButtonRight}>
        <Button fab color="primary" aria-label="add" onClick={() => {this.props.history.push('/record/group/add')}} >
          <AddIcon />
        </Button>
      </div>
      </Paper>
      </div>
      );

    }
}

export default GroupListing;
