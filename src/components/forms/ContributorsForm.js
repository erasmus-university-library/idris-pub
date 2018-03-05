import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';

import Card, { CardContent } from 'material-ui/Card';
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
import TextField from 'material-ui/TextField';
import Citation from '../widgets/Citation';
import styles from './formStyles.js';


@withStyles(styles)
class ContributorsForm extends Component {

    handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/work/${record.id}`);
        this.props.onChange({selected: record.id});
    }
    handleQueryChange = (event) => {
        const filters = Object.assign({}, this.props.filters);
        filters.contributor_person_id = this.props.id;
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

    componentWillMount(){
        if (this.props.id === 'add'){
            this.props.onChange({offset: 0, filters: {contributor_person_id: null}});
        } else if ((this.props.filters||{}).contributor_person_id !== this.props.id) {
            this.props.onChange({offset: 0, filters: {contributor_person_id: this.props.id}});
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.query !== this.props.query ||
            (nextProps.filters || {}).filter_type !== (this.props.filters || {}).filter_type ||
            (nextProps.filters || {}).start_date !== (this.props.filters || {}).start_date ||
            (nextProps.filters || {}).contributor_person_id !== (this.props.filters || {}).contributor_person_id ||
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
              (nextProps.filters || {}).contributor_person_id !== (this.props.filters || {}).contributor_person_id ||
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
          <CardContent className={classes.noPadding}>
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
            <MenuItem value={workType.id}>{workType.label}</MenuItem>
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
                <TableCell><Citation title={record.title}
                                     authors={record.contributors}
                                     affiliations={record.affiliations}/>
                </TableCell>
                <TableCell>{record.type}</TableCell>
                <TableCell>{record.issued}</TableCell>
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
        <Button fab color="primary" aria-label="add" onClick={() => {this.props.history.push('/record/work/add')}} >
          <AddIcon />
        </Button>
      </div>
      </Paper>
      </div>
      </CardContent>
      </Card>);

    }
}

export default ContributorsForm;
