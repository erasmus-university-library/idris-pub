import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Citation from '../widgets/Citation';

import styles from './formStyles.js';


@withStyles(styles)
class AffiliationsListing extends Component {

    handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/work/${record.id}`);
        this.props.onChange({selected: record.id});
    }
    handleQueryChange = (event) => {
        const filters = Object.assign({}, this.props.filters);
        filters.affiliation_group_id = this.props.id;
        this.props.onChange({query: event.target.value, offset: 0, filters});
    }

    handleFilterChange = (name) => (event) => {
        const filters = Object.assign({}, this.props.filters);
        filters[name] = event.target.value;
        this.props.onChange({offset: 0, filters})
    }

    handlePageChange = (event, page) => {
        this.props.onChange({offset: page * (this.props.limit || 10)});
    }


    handleRowsPerPageChange = event => {
      this.props.onChange({offset: 0, limit: event.target.value});
    };

    componentDidMount(){
        if (this.props.id === 'add'){
            this.props.onChange({offset: 0, filters: {affiliation_group_id: null}});
        } else if ((this.props.filters||{}).contributor_person_id !== this.props.id) {
            this.props.onChange({offset: 0, filters: {affiliation_group_id: this.props.id}});
        }
    }

  UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
            this.props.onChange({offset: 0, filters: {affiliation_group_id: nextProps.id}});
        }

        if (nextProps.query !== this.props.query ||
            (nextProps.filters || {}).filter_type !== (this.props.filters || {}).filter_type ||
            (nextProps.filters || {}).start_date !== (this.props.filters || {}).start_date ||
            (nextProps.filters || {}).affiliation_group_id !== (this.props.filters || {}).affiliation_group_id ||
            (nextProps.filters || {}).end_date !== (this.props.filters || {}).end_date ||
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
          if (nextProps.query !== this.props.query ||
              (nextProps.filters || {}).affiliation_group_id !== (this.props.filters || {}).affiliation_group_id ||
              (nextProps.filters || {}).start_date !== (this.props.filters || {}).start_date ||
              (nextProps.filters || {}).end_date !== (this.props.filters || {}).end_date
              ){
              // fetch after the timeout has passed
              this.timeoutId = setTimeout(fetchCallBack, 200);
          } else {
              fetchCallBack();
          }

      }
    }

    render(){
        const { settings, classes, query, filters, total, limit, offset, records } = this.props;
      return (
          <Card className={classes.editorCard}>
          <CardContent style={{padding: 0}}>
        <div>
        <Paper>
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">Search Works</InputLabel>
              <Input
                id="search"
                type="text"
                value={query || ''}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
              />
              </FormControl>
        <FormControl className={classes.formControlSelect}>
          <InputLabel htmlFor="work-type">Work Type</InputLabel>
          <Select
            value={(filters||{}).filter_type || ''}
            onChange={this.handleFilterChange('filter_type')}
            inputProps={{
              name: 'work_type',
              id: 'work-type',
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {settings.type.map(workType => (
            <MenuItem key={workType.id} value={workType.id}>{workType.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
          <TextField
          id="work-from-date"
          label="From Date"
          type="date"
          value={(filters||{}).start_date || ''}
          onChange={this.handleFilterChange('start_date')}
          className={classes.dateField}
          InputLabelProps={{
              shrink: true,
          }}
          />
          <TextField
          id="work-until-date"
          label="Until Date"
          type="date"
          value={(filters||{}).end_date || ''}
          onChange={this.handleFilterChange('end_date')}
          className={classes.dateField}
          InputLabelProps={{
              shrink: true,
          }}
          />
            </Toolbar>
          </AppBar>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Work</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Issued</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(records || []).map(record => (
              <TableRow key={record.id}
                        selected={record.id === this.props.selected}
                        onClick={this.handleRowClick(record)}
                        style={{cursor:'pointer'}}
                        hover>
                <TableCell><Citation citation={record.csl} /></TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell className={classes.nobr}>{record.issued}</TableCell>
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
        <Button variant="fab" color="primary" aria-label="add" onClick={() => {this.props.history.push('/record/work/add')}} >
          <AddIcon />
        </Button>
      </div>
      </Paper>
      </div>
      </CardContent>
      </Card>);

    }
}

export default AffiliationsListing;
