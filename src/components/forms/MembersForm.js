import React from 'react';
import { withStyles } from 'material-ui/styles';
import Card, { CardContent } from 'material-ui/Card';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import CardMembershipIcon from 'material-ui-icons/CardMembership';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import Collapse from 'material-ui/transitions/Collapse';

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

import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class MembersForm extends React.Component {
    handleRowClick = (record) => (event) => {
        this.props.history.push(`/record/person/${record.person_id}`);
        this.props.onChange({selected: record.id});

    }
    handleQueryChange = (event) => {
        this.props.onChange({query: event.target.value,
                             offset: 0,
                             group_id: this.props.id});
    }

    handlePageChange = (event, page) => {
        this.props.onChange({offset: page * (this.props.limit || 10)});
    }


    handleRowsPerPageChange = event => {
      this.props.onChange({offset: 0, limit: event.target.value});
    };

    componentWillMount(){
      if (this.props.offset === undefined){
          // first run
          this.props.onChange({offset: 0, filters: {group_id: this.props.id}});
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
      const { classes, onAccordionClicked, open, query, total, limit, offset, records } = this.props;
      return (<div><ListItem button onClick={onAccordionClicked} disableRipple={true}>
            <ListItemIcon><CardMembershipIcon /></ListItemIcon>
            <ListItemText primary="Members" />
            <ListItemIcon>{open ? <ExpandLess />: <ExpandMore />}</ListItemIcon>
          </ListItem>
          <Collapse in={open} unmountOnExit>
          <Card>
          <CardContent className={classes.accordionCard}>
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
            </Toolbar>
          </AppBar>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(records || []).map(record => (
              <TableRow key={record.id}
                        selected={record.id === this.props.selected}
                        onClick={this.handleRowClick(record)}
                        hover>
                <TableCell>{record.person_name}</TableCell>
                <TableCell>{record.start_date}</TableCell>
                <TableCell>{record.end_date}</TableCell>
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
        <Button fab color="primary" aria-label="add" onClick={this.handleRowClick('/record/group/add')} >
          <AddIcon />
        </Button>
      </div>
      </Paper>
      </div>
        </CardContent>
        </Card>
        </Collapse>
          </div>);

    }
}
export default MembersForm;
