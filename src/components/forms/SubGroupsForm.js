import React from 'react';
import { withStyles } from 'material-ui/styles';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import SupervisorAccountIcon from 'material-ui-icons/SupervisorAccount';

import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import SearchIcon from 'material-ui-icons/Search';
import IconButton from 'material-ui/IconButton';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardContent } from 'material-ui/Card';


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

    componentWillMount(){
        this.props.onChange({offset: 0, filters: {filter_parent: this.props.id}});
    }



    componentWillReceiveProps(nextProps) {
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
      const { classes, onAccordionClicked, open, query, total, limit, offset, records } = this.props;
      return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon><SupervisorAccountIcon /></ListItemIcon>
              <ListItemText primary="Sub Groups" />
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
          <Card className={classes.editorCard} style={{boxShadow:'unset'}}>
          <CardContent style={{padding:0}}>
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
          </ExpansionPanelDetails>
        </ExpansionPanel>
      );
    }
}
export default SubGroupsForm;

