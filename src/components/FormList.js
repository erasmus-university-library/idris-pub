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
class MembersList extends Component {

  handleChangePage = (event, page) => {
      this.props.updateMemberListing({offset: page * this.props.limit});
  }

  handleChangeQuery = (event) => {
      this.props.updateMemberListing({query: event.target.value,
                                    offset: 0});
  }

  handleChangeRowsPerPage = event => {
      this.props.updateMemberListing({offset: 0,
                                      limit: event.target.value});
  };

  handleRowClicked = (type, id) => event => {
      this.props.selectMember(type, id);
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.offset !== this.props.offset ||
          nextProps.limit !== this.props.limit ||
          !isEqual(this.props.filters, nextProps.filters)){
              this.props.fetchRecordListing(nextProps.type,
                                            nextProps.query,
                                            nextProps.filters,
                                            nextProps.offset,
                                            nextProps.limit)
          }
          this.props.updateMemberListing({isFetching: true});

      }
  }


  render() {
      const { classes , type, selectedKey } = this.props;

      if (!this.props.type){
          return null;
      }

      const columns = this.props.fields.map(field => {
          return <TableCell numeric={field.type === 'number'} key={field.id}>{field.label}</TableCell>;
      });

      const rows = this.props.records.map(record => {
            return (
              <TableRow key={record.id}
                        hover
                        selected={record.id === selectedKey}
                        className={classes.recordRow}
                        onClick={this.handleRowClicked(type, record.id)}>
                {this.props.fields.map(field => {
                    return <TableCell key={`${record.id}-${field.id}`}
                                      numeric={field.type === 'number'}>{record[field.id]}</TableCell>
                })}
              </TableRow>
            );
      });
      return (
      <Table className={classes.table} dense={true}>
        <TableHead>
          <TableRow>
            <TableCell>Foo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow hover
                    selected={record.id === selectedKey}
                    className={classes.recordRow}
                    onClick={this.handleRowClicked(type, record.id)}>
             <TableCell>Foo</TableCell>
          </TableRow>
        </TableBody>
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
         );
  }
}

export default MembersList;
