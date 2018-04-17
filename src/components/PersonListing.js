import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import SearchIcon from 'material-ui-icons/Search';
import IconButton from 'material-ui/IconButton';
import PersonAddIcon from 'material-ui-icons/PersonAdd';
import Button from 'material-ui/Button';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';
import { Link } from 'react-router-dom';

const styles = theme => ({
  formControl: {
    width: '100%',
  },
  table: {
      marginTop: theme.spacing.unit
  },
  link: {
     color: 'black',
     marginRight: '0.5em',
     textDecoration: 'none',
      '&:hover': {
          textDecoration: 'underline'
      }
  },
  fabButtonRight: {
      padding: theme.spacing.unit,
      display: 'flex',
      justifyContent: 'flex-end',
  },

});

@withStyles(styles)
class PersonListing extends Component {

    handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/person/${record.id}`);
        this.props.onChange({selected: record.id});

    }
    handleQueryChange = (event) => {
        this.props.onChange({query: event.target.value, offset: 0});
    }

    handlePageChange = (event, page) => {
        this.props.onChange({offset: page * (this.props.limit || 10)});
    }


    handleRowsPerPageChange = event => {
      this.props.onChange({offset: 0, limit: event.target.value});
    };

    componentWillMount(){
      this.props.changeAppHeader('Persons');
      if (this.props.offset === undefined){
          // first run
          this.props.onChange({offset: 0});
      }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.query !== this.props.query ||
            nextProps.offset !== this.props.offset ||
            nextProps.limit !== this.props.limit){
            // a fetch is needed
          if (this.timeoutId){
              // a fetch is in already scheduled with a timeout, cancel it
              clearTimeout(this.timeoutId);
          }

          const fetchCallBack = () => {
              this.props.onFetch(nextProps.query,
                                 nextProps.filters,
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
        const { classes, query, total, limit, offset, records } = this.props;
      return (
        <div>
        <Paper>
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">{`Search Persons`}</InputLabel>
              <Input
                id="search"
                type="text"
                value={query || ''}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
              />
              </FormControl>
            </Toolbar>
          </AppBar>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Group Memberships</TableCell>
            <TableCell numeric style={{width:80}}>Memberships</TableCell>
            <TableCell numeric style={{width:80}}>Work Contributions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(records || []).map(record => (
              <TableRow key={record.id}
                        selected={record.id === this.props.selected}
                        onClick={this.handleRowClick(record)}
                        style={{cursor:'pointer'}}
                        hover>
                <TableCell style={{whiteSpace: 'nowrap'}}>{record.name}</TableCell>
                <TableCell>
              {record.groups.map((group) => (<Link className={classes.link} to={`/record/group/${group.id}`} onClick={(e) => (e.stopPropagation())}>{group.name}</Link>))}
                </TableCell>
                <TableCell numeric>{record.memberships}</TableCell>
                <TableCell numeric>{record.works}</TableCell>
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
        <Button fab color="primary" aria-label="add" onClick={() => {this.props.history.push('/record/person/add')}} >
          <PersonAddIcon />
        </Button>
      </div>
      </Paper>
      </div>
      );

    }
}

export default PersonListing;
