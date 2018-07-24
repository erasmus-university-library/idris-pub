import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
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

import TextField from '@material-ui/core/TextField';
import MemberAddForm from './MemberAddForm.js'
import { Link } from 'react-router-dom';

import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class MembersListing extends React.Component {
    handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/person/${record.person_id}`);
        this.props.onChange({selected: record.person_id});

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

    componentDidMount(){
        if (this.props.id === 'add'){
            this.props.onChange({offset: 0, filters: {group_id: null}});
        } else if ((this.props.filters||{}).group_id !== this.props.id) {
            this.props.onChange({offset: 0, filters: {group_id: this.props.id}});
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.id !== this.props.id){
            this.props.onChange({offset: 0, filters: {group_id: nextProps.id}});
        }

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
      const { classes, query, total, limit, offset, records, filters } = this.props;
      return (
        <Card className={classes.editorCard}>
          <CardContent className={classes.noPadding}>
        <div>
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
            <TableCell numeric>Works</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(records || []).map(record => (
              <TableRow key={record.person_id}
                        selected={record.person_id === this.props.selected}
                        onClick={this.handleRowClick(record)}
                        style={{cursor:'pointer'}}
                        hover>
                <TableCell style={{whiteSpace: 'nowrap'}}>{record.person_name}</TableCell>
                <TableCell>
              {record.groups.map((group) => (<Link key={group.id} className={classes.link} to={`/record/group/${group.id}`} onClick={(e) => (e.stopPropagation())}>{group.name}</Link>))}
                </TableCell>
                <TableCell>{record.earliest}</TableCell>
                <TableCell>{record.latest}</TableCell>
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
      <div>
        <MemberAddForm group={this.props.id} onSubmit={this.props.onMemberAdd}/>
      </div>
      </div>
        </CardContent>
        </Card>
        );
    }
}
export default MembersListing;
