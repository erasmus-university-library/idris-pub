import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Field, Fields, FieldArray } from 'redux-form'
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import FormatQuoteIcon from 'material-ui-icons/FormatQuote';
import Badge from 'material-ui/Badge';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import SearchIcon from 'material-ui-icons/Search';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';
import Chip from 'material-ui/Chip';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardActions, CardContent } from 'material-ui/Card';

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';


@withStyles(styles, { withTheme: true })
class DescriptionsForm extends React.Component {
    state = {
        limit: 5,
        offset: 0,
        total: 0,
        selected: null,
        query: '',
        targetWorkTypeFilter: '',
    };


    addDescription = (position=null) => {
        // note: this.descriptionFields is set in the renderDescriptions
        // method, we should figure how to get use the global arrayPush redux-form action
        const newDescription = {type: 'abstract', format:'text'};
        let selected = position
        if (position === null){
            this.descriptionFields.push(newDescription);
            selected = this.descriptionFields.length
        } else {
            this.descriptionFields.insert(position, newDescription);
        }
        const total = this.descriptionFields.length;
        this.setState({selected: selected,
                       total: total,
                       query: '',
                       offset: Math.floor(selected/this.state.limit) * this.state.limit});
    }

    getErrorCount(errors) {
        if (!errors || !errors.descriptions){
            return 0
        }
        let errorCount = 0;
        for (const error of Object.values(errors.descriptions)){
          for (const field of ['type', 'format', 'value', 'target_id']){
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
        this.descriptionFields.getAll().map(description => {
            if (query && description.value.toLowerCase().indexOf(query) === -1){
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
        const { classes,
                descriptionTypeOptions, descriptionFormatOptions,
                typeOptions } = this.props;
        const { targetWorkTypeFilter } = this.state;
        const style = {}
        if (error !== null){
            style.border = '2px dotted red';
        }
        return (
           <TableRow key={index} selected={true} style={style}>

            <TableCell colSpan="3" style={{padding:24}}>
            <Card>
            <CardContent>
            <div style={{display:'flex'}}>
             <Field name={`${field}.type`}
                    component={mappedSelect}
                    options={descriptionTypeOptions}
                    label="Description Type"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Field name={`${field}.format`}
                    component={mappedSelect}
                    options={descriptionFormatOptions}
                    label="Format"
                    className={classes.dateField}
                    InputLabelProps={{shrink: true}}/>
            </div>
            <div className={classes.formFieldRow}>
            <Field name={`${field}.value`}
                    component={mappedTextField}
                    label="Value (Text)"
                    multiline
                    rowsMax="10"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
            </div>
            <div style={{display:'flex'}}>
            <FormControl className={classes.formControlSelect}>
              <InputLabel htmlFor="target-work-type-filter">Work Type</InputLabel>
                <Select  value={targetWorkTypeFilter}
                         onChange={this.handleTargetWorkTypeFilterChange}
                         inputProps={{id: 'target-work-type-filter'}}>
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {typeOptions.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
             <span className={classes.gutter}> </span>
             <Fields names={[`${field}.target_id`, `${field}._target_name`]}
                    component={mappedRelationField}
                    placeholder="Work Reference"
                    kind="work"
                    filters={{type:targetWorkTypeFilter}}
                    className={classes.flex} />
            </div>
            </CardContent>
            <CardActions>
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="delete" onClick={() => this.addDescription(index)} >
                <AddIcon /> Insert Description
              </Button>
              <Button color="primary" aria-label="delete" onClick={() => fields.remove(index)} >
                <DeleteIcon /> Remove Description
              </Button>
              </div>
             </CardActions>
            </Card>
            </TableCell>
           </TableRow>);

    }

    renderDescriptions = (props) => {
        const { fields, offset, limit, selected, query, errors } = props;
        this.descriptionFields = fields;
        let errorMessages = {}
        if (errors !== null){
            errorMessages = errors.descriptions;
        }
        let filteredIndex = -1;
        const filteredFields = [];
        fields.forEach(
            (field, index) => {
                let values = fields.get(index)
                if (query && values.value.toLowerCase().indexOf(query) === -1){
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
                        <TableCell style={{whiteSpace: 'nowrap'}}>{values.type}</TableCell>
                        <TableCell>{values.value}</TableCell>
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
        const descriptionCount = (formValues || []).length;
        return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked} CollapseProps={{ unmountOnExit: true }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><FormatQuoteIcon /></Badge>: <FormatQuoteIcon />}</ListItemIcon>
              <ListItemText primary="Descriptions" />
            {descriptionCount?<Chip label={descriptionCount} align="right" key={descriptionCount}/>:null}
            <div/>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
          <CardContent style={{padding: '16px 0px 0px 0px'}}>
          {descriptionCount > 5?
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">{`Filter Descriptions`}</InputLabel>
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
        {descriptionCount > 1?
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>:null}
        <TableBody>
          <FieldArray name="descriptions"
                      component={this.renderDescriptions}
                      offset={offset}
                      limit={limit}
                      selected={selected}
                      query={query}
                      targetWorkTypeFilter={targetWorkTypeFilter}
                      errors={errors} />
          </TableBody>
        {descriptionCount > 5?
        <TableFooter>
          <TableRow>
            <TablePagination
              count={total || descriptionCount}
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
              <Button color="primary" aria-label="add" onClick={() => this.addDescription(null)} >
                <AddIcon /> Add Description
              </Button>
              </div>

          </CardActions>
          </Card>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        );
    }
}
export default DescriptionsForm;
