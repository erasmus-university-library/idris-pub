import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class SubGroupsForm extends React.Component {


  handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/group/${record.id}`);
        this.props.onChange({selected: record.id, records: []});

    }
    handleQueryChange = (event) => {
        this.props.onChange({query: event.target.value,
                             offset: 0,
                             filters: {filter_parent: this.props.id}});
    }

    handlePageChange = (event, page) => {
        this.props.onChange({offset: page * (this.props.limit || 10)});
    }


    handleRowsPerPageChange = event => {
      this.props.onChange({offset: 0, limit: event.target.value});
    };

    componentDidMount(){
        this.props.onChange({offset: 0, filters: {filter_parent: this.props.id}});
    }



    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
            this.props.onChange({offset: 0, filters: {filter_parent: nextProps.id}});
        }
        if (nextProps.query !== this.props.query ||
            nextProps.offset !== this.props.offset ||
            (nextProps.filters || {}).filter_parent !== (this.props.filters || {}).filter_parent ||
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
        <Card className={classes.editorCard}>
          <CardContent className={classes.noPadding}>
        <div>
        <Paper>
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">{`Search Groups`}</InputLabel>
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
      </Paper>
      </div>
        </CardContent>
          </Card>
      );
    }
}
export default SubGroupsForm;
