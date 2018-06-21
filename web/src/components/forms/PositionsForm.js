import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Fields, FieldArray } from 'redux-form'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import WorkIcon from '@material-ui/icons/Work';
import Badge from '@material-ui/core/Badge';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import { MenuItem } from '@material-ui/core/Menu';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Link } from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';


@withStyles(styles, { withTheme: true })
class PositionsForm extends React.Component {
    state = {
        limit: 5,
        offset: 0,
        total: 0,
        selected: null,
        query: '',
    };


    addPosition = (position=null) => {
        // note: this.positionFields is set in the renderPositions
        // method, we should figure how to get use the global arrayPush redux-form action
        const newPosition = {};
        let selected = position
        if (position === null){
            this.positionFields.push(newPosition);
            selected = this.positionFields.length
        } else {
            this.positionFields.insert(position, newPosition);
        }
        const total = this.positionFields.length;
        this.setState({selected: selected,
                       total: total,
                       query: '',
                       offset: Math.floor(selected/this.state.limit) * this.state.limit});
    }

    getErrorCount(errors) {
        if (!errors || !errors.positions){
            return 0
        }
        let errorCount = 0;
        for (const error of Object.values(errors.positions)){
          for (const field of ['group_id', 'type', 'start_date', 'end_date', 'description']){
              if (error[field] !== undefined){
                errorCount += 1;
              }
          }
        }
        return errorCount
    }
    handleRowClick = (index) => (event) => {
        this.setState({selected: index});
    }

    calcFilteredTotal = (query) =>{
        // calculate the new total fields after filtering
        // this is double work, but it needs to be done before
        // rendering the table rows to set the total pagination count
        // correctly
        let filteredTotal = 0;
        this.positionFields.getAll().map(position => {
            if (query && position._target_name.toLowerCase().indexOf(query) === -1){
                return null
            }
            filteredTotal += 1;
            return null;
        })
        return filteredTotal
    }

    handleTargetWorkTypeFilterChange = event => {
        this.setState({targetWorkTypeFilter: event.target.value})
    }

    handleQueryChange = event => {
        // calc new total value
        const query = event.target.value;
        this.setState({offset: 0,
                       selected: null,
                       total: this.calcFilteredTotal(query),
                       query});
    }

    handlePageChange = (event, page) => {
        this.setState({offset: page * this.state.limit})
    }


    handleRowsPerPageChange = event => {
        this.setState({offset: 0, limit: event.target.value});
    };

    renderForm = (fields, field, index, error) => {
        const { classes, positionOptions, typeOptions } = this.props;
        const style = {}
        if (error !== null){
            style.border = '2px dotted red';
        }
        return (
           <TableRow key={index} selected={true} style={style}>

            <TableCell colSpan="4" style={{padding:24}}>
            <Card>
            <CardContent>
            <div style={{display:'flex'}}>
             <Field name={`${field}.type`}
                    component={mappedSelect}
                    options={positionOptions}
                    label="Position Type"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Fields names={[`${field}.group_id`, `${field}._group_name`]}
                    component={mappedRelationField}
                    placeholder="Organisation"
                    kind="group"
                    className={classes.flex} />
            </div>
            <div className={classes.formFieldRow}>
             <Field name={`${field}.description`}
                    component={mappedTextField}
                    label="Description"
                    multiline
                    rowsMax="4"
                    className={classes.flex}/>
            </div>
            <div className={classes.formFieldRow}>
             <Field name={`${field}.location`}
                    component={mappedTextField}
                    label="Location"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.start_date`}
                    component={mappedTextField}
                    label="Start Date"
                    type="date"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.end_date`}
                    component={mappedTextField}
                    label="End Date"
                    type="date"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
            </div>
            </CardContent>
            <CardActions>
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="delete" onClick={() => this.addPosition(index)} >
                <AddIcon /> Insert Position
              </Button>
              <Button color="primary" aria-label="delete" onClick={() => fields.remove(index)} >
                <DeleteIcon /> Remove Position
              </Button>
              </div>
             </CardActions>
            </Card>
            </TableCell>
           </TableRow>);

    }

    renderPositions = (props) => {
        const { fields, offset, limit, selected, query, errors } = props;
        const { classes } = this.props;
        this.positionFields = fields;
        let errorMessages = {}
        if (errors !== null){
            errorMessages = errors.positions;
        }
        let filteredIndex = -1;
        const filteredFields = [];
        fields.forEach(
            (field, index) => {
                let values = fields.get(index)
                if (query && values._target_name.toLowerCase().indexOf(query) === -1){
                    return
                }
                filteredIndex += 1;
                if (filteredIndex >= offset && filteredIndex < offset + limit){
                    let style = {cursor:'pointer'};
                    if (errorMessages[index] !== undefined){
                        style.border = '2px dotted red';
                    }
                    let frag = (<TableRow key={index}
                                          selected={index === selected}
                                          onClick={this.handleRowClick(index)}
                                          style={style}
                                          hover>
                        <TableCell>
                        <IconButton to={`/record/group/${values.group_id}`}
                                    onClick={(e) => (e.stopPropagation())}
                                    className={classes.listingPositionIconLink}
                                    component={Link}><OpenInNewIcon/></IconButton>
                        {values._group_name}
                        </TableCell>
                        <TableCell style={{whiteSpace: 'nowrap'}}>{values.type}</TableCell>
                        <TableCell>{values.start_date}</TableCell>
                        <TableCell>{values.end_date}</TableCell>
                        </TableRow>);
                    if (index === this.state.selected){
                        frag = this.renderForm(fields, field, index, errorMessages[index] || null)
                    }
                    filteredFields.push(frag);
                }
            });
        return filteredFields
    }

    shouldComponentUpdate(nextProps, nextState){
        if (nextProps.open === false &&
            nextProps.open === this.props.open &&
            (this.props.formValues || []).length === (nextProps.formValues || []).length){
            return false
        }
        return true;
    }

    render(){
        const { classes, onAccordionClicked, open, errors, formValues } = this.props;
        const errorCount = this.getErrorCount(errors);
        const { limit, offset, selected, total, query, targetWorkTypeFilter } = this.state;
        const positionCount = (formValues || []).length;
        return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked} CollapseProps={{ unmountOnExit: true }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><WorkIcon /></Badge>: <WorkIcon />}</ListItemIcon>
              <ListItemText primary="External employment and side positions" />
            {positionCount?<Chip label={positionCount} align="right" key={positionCount}/>:null}
            <div/>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
          <CardContent style={{padding: '16px 0px 0px 0px'}}>
          {positionCount > 5?
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">{`Filter Positions`}</InputLabel>
              <Input
                id="search"
                type="text"
                value={query || ''}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
              />
        </FormControl>
            </Toolbar>
          </AppBar>:null}
      <Table className={classes.table}>
        {positionCount > 0?
        <TableHead>
          <TableRow>
            <TableCell>Organisation</TableCell>
            <TableCell>Type</TableCell>
            <TableCell className={classes.dateField}>Start Date</TableCell>
            <TableCell className={classes.dateField}>End Date</TableCell>
          </TableRow>
        </TableHead>:null}
        <TableBody>
          <FieldArray name="positions"
                      component={this.renderPositions}
                      offset={offset}
                      limit={limit}
                      selected={selected}
                      query={query}
                      targetWorkTypeFilter={targetWorkTypeFilter}
                      errors={errors} />
          </TableBody>
        {positionCount > 5?
        <TableFooter>
          <TableRow>
            <TablePagination
              count={total || positionCount}
              rowsPerPage={limit}
              page={(offset) / (limit)}
              onChangePage={this.handlePageChange}
              onChangeRowsPerPage={this.handleRowsPerPageChange}>
          </TablePagination>
          </TableRow>
        </TableFooter>:null}
      </Table>

        </CardContent>
          <CardActions>
          <Button type="submit" color="primary">
          Update
          </Button>
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="add" onClick={() => this.addPosition(null)} >
                <AddIcon /> Add Position
              </Button>
              </div>

          </CardActions>
          </Card>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        );
    }
}
export default PositionsForm;
