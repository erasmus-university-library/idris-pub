import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
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
      this.props.handleFetch(this.props.type,
                             this.props.query,
                             page * this.props.limit,
                             this.props.limit);
  }

  handleChangeQuery = (event) => {
      let offset = 0;
      let timeout = 250;
      this.props.handleFetch(this.props.type,
                             event.target.value,
                             offset,
                             this.props.limit,
                             timeout);
  }

  handleChangeRowsPerPage = event => {
      let offset = 0;
      let limit = event.target.value;
      this.props.handleFetch(this.props.type,
                             this.props.query,
                             offset,
                             limit);
  };

  render() {
      const { classes } = this.props;

      if (!this.props.type){
          return null;
      }
      return (
          <div>
        <Paper className={classes.root}>
          <AppBar position="static" color="inherit">
          <Toolbar>
          <FormControl fullWidth className={classes.formControl}>
          <InputLabel htmlFor="search">{`Search ${this.props.label}`}</InputLabel>
          <Input
            id="search"
            type="text"
            value={this.props.query}
            onChange={this.handleChangeQuery}
            endAdornment={<InputAdornment><IconButton><SearchIcon /></IconButton></InputAdornment>}
          />
        </FormControl>
          </Toolbar>
      </AppBar>
        </Paper>
        <Paper className={classes.root}>

      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell numeric>Memberships</TableCell>
            <TableCell>Accounts</TableCell>
            <TableCell>Last Modified</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.props.records.map(record => {
            return (
              <TableRow key={record.id}>
                <TableCell>{record.name}</TableCell>
                <TableCell numeric>0</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={this.props.total}
              rowsPerPage={this.props.limit}
              page={this.props.page}
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
