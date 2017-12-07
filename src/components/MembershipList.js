import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import isEqual  from 'lodash/isEqual';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';

import styles from './RecordListStyles.js'

@withStyles(styles)
class MembershipList extends Component {

  handleChangePage = (event, page) => {
      this.props.updateMembershipListing({offset: page * this.props.limit});
  }

  handleChangeQuery = (event) => {
      this.props.updateMembershipListing({query: event.target.value,
                                      offset: 0});
  }

  handleChangeRowsPerPage = event => {
      this.props.updateMembershipListing({offset: 0,
                                      limit: event.target.value});
  };

  handleRowClicked = (type, id) => event => {
      this.props.selectMembership(type, id);
  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.offset !== this.props.offset ||
          nextProps.limit !== this.props.limit ||
          !isEqual(this.props.filters, nextProps.filters)){
          // a fetch is needed
          console.log('do fetch!')
              this.props.fetchMembershipListing(nextProps.type,
                                            nextProps.query,
                                            nextProps.filters,
                                            nextProps.offset,
                                            nextProps.limit)
          }
          this.props.updateMembershipListing({isFetching: true});

  }



  render() {
      const { classes } = this.props;
      let total = 0;
      let offset = 0;
      let limit = 10;
      return (
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Foo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow><TableCell>Foo</TableCell></TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={total}
              rowsPerPage={limit}
              page={offset / limit}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage} />
          </TableRow>
        </TableFooter>
      </Table>
         );
  }
}

export default MembershipList;
