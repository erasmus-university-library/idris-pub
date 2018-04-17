import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Field, Fields, FieldArray } from 'redux-form'
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import FavoriteIcon from 'material-ui-icons/Favorite';
import Badge from 'material-ui/Badge';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Input, { InputLabel, InputAdornment } from 'material-ui/Input';
import { FormControl } from 'material-ui/Form';
import Chip from 'material-ui/Chip';
import SearchIcon from 'material-ui-icons/Search';
import Table, { TableBody, TableCell, TableHead, TableRow,
                TableFooter, TablePagination } from 'material-ui/Table';
import { Link } from 'react-router-dom';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardActions, CardContent } from 'material-ui/Card';
import { MenuItem } from 'material-ui/Menu';
import Select from 'material-ui/Select';

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';

import CaleidoSDK from '../../sdk.js';
const sdk = new CaleidoSDK();


@withStyles(styles, { withTheme: true })
class ContributorsForm extends React.Component {
    state = {
        limit: 5,
        offset: 0,
        total: 0,
        selected: null,
        query: '',
        affiliationFilter: '',
    };


    addContributor = (position=null) => {
        // note: this.contributorFields is set in the renderContributors
        // method, we should figure how to get use the global arrayPush redux-form action
        const newContributor = {role: 'author'};
        let selected = position
        if (position === null){
            this.contributorFields.push(newContributor);
            selected = this.contributorFields.length
        } else {
            this.contributorFields.insert(position, newContributor);
        }
        const total = this.contributorFields.length;
        this.setState({selected: selected,
                       total: total,
                       query: '',
                       affiliationFilter: '',
                       offset: Math.floor(selected/this.state.limit) * this.state.limit});
    }

    getErrorCount(errors) {
        if (!errors || !errors.contributors){
            return 0
        }
        let errorCount = 0;
        for (const error of Object.values(errors.contributors)){
          for (const field of ['person_id', 'role', 'start_date', 'end_date']){
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

    calcFilteredTotal = (query, affiliationFilter) =>{
        // calculate the new total fields after filtering
        // this is double work, but it needs to be done before
        // rendering the table rows to set the total pagination count
        // correctly
        let filteredTotal = 0;
        this.contributorFields.getAll().map(contributor => {
            if (query && contributor._person_name.toLowerCase().indexOf(query) === -1){
                return null
            }
            if (affiliationFilter){
                if (contributor.affiliations.length === 0){
                    return null
                }

                let affMatch = false;
                contributor.affiliations.map(aff => {
                    if (aff._group_name === affiliationFilter){
                        affMatch = true;
                    }
                    return null;
                });
                if (affMatch === false){
                    return null;
                }
            }
            filteredTotal += 1;
            return null;
        })
        return filteredTotal
    }

    handleQueryChange = event => {
        // calc new total value
        const query = event.target.value;
        this.setState({offset: 0,
                       selected: null,
                       total: this.calcFilteredTotal(query, this.state.affiliationFilter),
                       query});
    }

    handleAffiliationFilterChange = event =>{
        this.setState({offset: 0,
                       total: this.calcFilteredTotal(this.state.query, event.target.value),
                       selected: null,
                       affiliationFilter: event.target.value});
    }

    handlePageChange = (event, page) => {
        this.setState({offset: page * this.state.limit})
    }


    handleRowsPerPageChange = event => {
        this.setState({offset: 0, limit: event.target.value});
    };

    handleContributorFormPersonChange = (fields, field, index) => (person_id) => {
        // the person id of the contributor changed, remove all affiliations
        this.props.formActions.arrayRemoveAll(`${field}.affiliations`)

        sdk.recordList('membership', '', {person_id: person_id,
                                          start_date: this.props.workDateIssued || ''})
           .then(response => response.json(),
                 error => {console.log('RelationField Error: ' + error)})
           .then(data => {
               if (data.status === 'ok'){
                   for (const s of data.snippets[0].groups) {
                       this.props.formActions.arrayPush(
                           `${field}.affiliations`,
                           {'group_id': s.id, '_group_name': s.name})
               };
           }});
    }

    renderAffiliations = (affiliations) => {
        const { classes } = this.props;
        const affiliationFields = affiliations.fields.map( (affiliation, index) => (
            <div className={classes.formItem} key={index}>
             <Fields names={[`${affiliation}.group_id`, `${affiliation}._group_name`]}
                    component={mappedRelationField}
                    placeholder="Affiliation"
                    kind="group"
                    className={classes.flex}/>
             <IconButton aria-label="Delete" onClick={() => affiliations.fields.remove(index)}><DeleteIcon /></IconButton>
            </div>));
        return (<div>
            {affiliationFields}
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="add" onClick={() => affiliations.fields.push({})} >
                <AddIcon /> Add Affiliation
              </Button>
              </div>
            </div>);
    }
    renderForm = (fields, field, index, error) => {
        const { classes, contributorOptions } = this.props;
        const style = {}
        if (error !== null){
            style.border = '2px dotted red';
        }
        return (
           <TableRow key={index} selected={true} style={style}>

            <TableCell colSpan="5" style={{padding:24}}>
            <Card>
            <CardContent>
            <div className={classes.formItem}>
             <Field name={`${field}.role`}
                    component={mappedSelect}
                    options={contributorOptions}
                    label="Role"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Fields names={[`${field}.person_id`, `${field}._person_name`]}
                    component={mappedRelationField}
                    onRelationChange={this.handleContributorFormPersonChange(fields, field, index)}
                    placeholder="Person"
                    kind="person"
                    className={classes.flex}/>
            </div>
            <div>
              <FieldArray name={`${field}.affiliations`}
                          component={this.renderAffiliations}/>
           </div>
            <div className={classes.formFieldRow}>
             <Field name={`${field}.total`}
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
              <Button color="primary" aria-label="delete" onClick={() => this.addContributor(index)} >
                <AddIcon /> Insert Contributor
              </Button>
              <Button color="primary" aria-label="delete" onClick={() => fields.remove(index)} align="right">
                <DeleteIcon /> Remove Contributor
              </Button>
              </div>
             </CardActions>
            </Card>
            </TableCell>
           </TableRow>);

    }

    renderContributors = (props) => {
        const { fields, offset, limit, selected, query, affiliationFilter, errors } = props;
        this.contributorFields = fields;
        let errorMessages = {}
        if (errors !== null){
            errorMessages = errors.contributors;
        }
        const { classes } = this.props;
        let filteredIndex = -1;
        const filteredFields = [];
        this.affiliationNames = new Set();
        fields.forEach(
            (field, index) => {
                let values = fields.get(index)
                if (query && values._person_name.toLowerCase().indexOf(query) === -1){
                    return
                }
                if (affiliationFilter && values.affiliations.length === 0){
                    return
                }
                let affMatch = false;
                (values.affiliations||[]).map(aff => {
                    this.affiliationNames.add(aff._group_name)
                    if (affiliationFilter && aff._group_name === affiliationFilter){
                        affMatch = true;
                    }
                    return null;
                });
                if (affiliationFilter && affMatch === false){
                    return;
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
                        <TableCell style={{whiteSpace: 'nowrap'}}>{values._person_name}</TableCell>
                        <TableCell>
                {(values.affiliations||[]).map((affiliation, index) => (
                    [<Link className={classes.link}
                             key={affiliation.id}
                             to={`/record/group/${affiliation.group_id}`}
                             onClick={(e) => (e.stopPropagation())}>{affiliation._group_name}</Link>,
                    values.affiliations.length === index+1? null: '⸱ '
                    ]))}
                        </TableCell>
                        <TableCell>{values.role}</TableCell>
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
        const { limit, offset, selected, total, query, affiliationFilter } = this.state;
        const contributorCount = (formValues || []).length;

        if (this.affiliationNames === undefined){
            this.affiliationNames = new Set();
            formValues.forEach(contributor => {
                if (contributor.affiliations){
                    contributor.affiliations.forEach(aff => {
                        this.affiliationNames.add(aff._group_name);
                    })
                }
            })
        }
        return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked} CollapseProps={{ unmountOnExit: true }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><FavoriteIcon /></Badge>: <FavoriteIcon />}</ListItemIcon>
              <ListItemText primary="Contributors" />
            {contributorCount?<Chip label={contributorCount} align="right" key={contributorCount}/>:null}
            <div/>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
          <CardContent style={{padding: '16px 0px 0px 0px'}}>
          {contributorCount > 5?
          <AppBar position="static" color="default">
            <Toolbar>
              <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search">{`Filter Contributors`}</InputLabel>
              <Input
                id="search"
                type="text"
                value={query || ''}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
              />
        </FormControl>
        <FormControl className={classes.formControlSelect}>
          <InputLabel htmlFor="aff-filter">Affiliations</InputLabel>

            <Select
            value={affiliationFilter}
            onChange={this.handleAffiliationFilterChange}
            inputProps={{
              id: 'aff-filter',
            }}
            >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {Array.from(this.affiliationNames).map(affName => (
            <MenuItem value={affName} key={affName}>{affName}</MenuItem>
            ))}
          </Select>
              </FormControl>
            </Toolbar>
          </AppBar>:null}
      <Table className={classes.table}>
        {contributorCount > 0?
        <TableHead>
          <TableRow>
            <TableCell>Person</TableCell>
            <TableCell>Affiliations</TableCell>
            <TableCell className={classes.dateField}>Role</TableCell>
          </TableRow>
        </TableHead>:null}
        <TableBody>
          <FieldArray name="contributors"
                      component={this.renderContributors}
                      offset={offset}
                      limit={limit}
                      selected={selected}
                      query={query}
                      errors={errors}
                      affiliationFilter={affiliationFilter}/>
          </TableBody>
        {contributorCount > 5?
        <TableFooter>
          <TableRow>
            <TablePagination
              count={total || contributorCount}
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
              <Button color="primary" aria-label="add" onClick={() => this.addContributor(null)} >
                <AddIcon /> Add Contributor
              </Button>
              </div>

          </CardActions>
          </Card>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        );
    }
}
export default ContributorsForm;
