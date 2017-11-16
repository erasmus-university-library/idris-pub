import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import isEqual  from 'lodash/isEqual';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import SearchIcon from 'material-ui-icons/Search';
import IconButton from 'material-ui/IconButton';

import styles from './RecordListStyles.js'

@withStyles(styles)
class RecordList extends Component {

  handleChangePage = (event, page) => {
      this.props.updateRecordListing({offset: page * this.props.limit});
  }

  handleChangeQuery = (event) => {
      this.props.updateRecordListing({query: event.target.value,
                                      offset: 0});
  }

  handleChangeRowsPerPage = event => {
      this.props.updateRecordListing({offset: 0,
                                      limit: event.target.value});
  };

  componentWillReceiveProps(nextProps) {
      if (nextProps.type !== this.props.type ||
          nextProps.query !== this.props.query ||
          nextProps.offset !== this.props.offset ||
          nextProps.limit !== this.props.limit ||
          !isEqual(this.props.filters, nextProps.filters)){
          // a fetch is needed
          if (this.props.timeoutId){
              // a fetch is in already scheduled with a timeout, cancel it
              clearTimeout(this.props.timeoutId);
            }


          let timeoutId = null;
          if (nextProps.query !== this.props.query){
              // fetch after the timeout has passed
              let timeout = 200;
              timeoutId = setTimeout(() => {
                  this.props.fetchRecordListing(nextProps.type,
                                                nextProps.query,
                                                nextProps.filters,
                                                nextProps.offset,
                                                nextProps.limit);
              }, timeout);
          } else {
              this.props.fetchRecordListing(nextProps.type,
                                            nextProps.query,
                                            nextProps.filters,
                                            nextProps.offset,
                                            nextProps.limit)
          }
          this.props.updateRecordListing({isFetching: true,
                                          timeoutId});

      }
  }


  render() {
      const { classes } = this.props;

      if (!this.props.type){
          return null;
      }

      const columns = this.props.fields.map(field => {
          return <TableCell numeric={field.type === 'number'} key={field.id}>{field.label}</TableCell>;
      });

      const rows = this.props.records.map(record => {
            return (
              <TableRow key={record.id}>
                {this.props.fields.map(field => {
                    return <TableCell key={`${record.id}-${field.id}`}
                                      numeric={field.type === 'number'}>{record[field.id]}</TableCell>
                })}
              </TableRow>
            );
      });
      return (
          <div>
        <Paper className={classes.root}>
          <AppBar position="static" color="default">
          <Toolbar>
          <FormControl fullWidth className={classes.formControl}>
          <InputLabel htmlFor="search">{`Search ${this.props.label}`}</InputLabel>
          <Input
            id="search"
            type="text"
            value={this.props.query}
            onChange={this.handleChangeQuery}
            endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
          />
        </FormControl>
          </Toolbar>
      </AppBar>
        </Paper>
        <Paper className={classes.root}>

      <Table className={classes.table}>
        <TableHead>
          <TableRow button>{columns}</TableRow>
        </TableHead>
        <TableBody>{rows}</TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={this.props.total}
              rowsPerPage={this.props.limit}
              page={this.props.offset / this.props.limit}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage} />
          </TableRow>
        </TableFooter>
      </Table>
      </Paper>
          </div>
         );
  }
}

export default RecordList;
