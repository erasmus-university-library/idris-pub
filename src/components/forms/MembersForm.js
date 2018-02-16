import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import SearchIcon from 'material-ui-icons/Search';
import IconButton from 'material-ui/IconButton';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';

import TextField from 'material-ui/TextField';
import MemberAddForm from './MemberAddForm.js'
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class MembersForm extends React.Component {
    handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/person/${record.person_id}`);
        this.props.onChange({selected: record.id});

    }
    handleQueryChange = (event) => {
        const filters = Object.assign({}, this.props.filters);
        filters.group_id = this.props.id;
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
            this.props.onChange({offset: 0, filters: {group_id: null}});
        } else if ((this.props.filters||{}).group_id !== this.props.id) {
            this.props.onChange({offset: 0, filters: {group_id: this.props.id}});
        }
    }

    componentWillReceiveProps(nextProps) {

        if (nextProps.query !== this.props.query ||
            nextProps.offset !== this.props.offset ||
            (nextProps.filters || {}).group_id !== (this.props.filters || {}).group_id ||
            (nextProps.filters || {}).start_date !== (this.props.filters || {}).start_date ||
            (nextProps.filters || {}).end_date !== (this.props.filters || {}).end_date ||
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
      const { classes, query, total, limit, offset, records, filters} = this.props;
      return (
          <Card className={classes.editorCard}>
          <CardContent>
        <div>
        <Paper>
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">{`Search Members`}</InputLabel>
              <Input
                id="search"
                type="text"
                value={query || ''}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
              />
              </FormControl>
          <TextField
          id="active-membership-from-date"
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
          id="active-membership-until-date"
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
            <TableCell>Name</TableCell>
            <TableCell>Groups</TableCell>
            <TableCell>From Date</TableCell>
            <TableCell>Until Date</TableCell>
            <TableCell numeric style={{width:80}}>Memberships</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(records || []).map(record => (
              <TableRow key={record.id}
                        selected={record.id === this.props.selected}
                        onClick={this.handleRowClick(record)}
                        style={{cursor:'pointer'}}
                        hover>
                <TableCell>{record.person_name}</TableCell>
                <TableCell>{record.groups}</TableCell>
                <TableCell>{record.earliest}</TableCell>
                <TableCell>{record.latest}</TableCell>
                <TableCell numeric>{record.memberships}</TableCell>
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
      <div>
        <MemberAddForm group={this.props.id} onSubmit={this.props.onMemberAdd}/>
      </div>
      </Paper>
      </div>
        </CardContent>
        </Card>);

    }
}
export default MembersForm;
