import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Fields, FieldArray } from 'redux-form'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import { mappedTextField, mappedSelect, mappedRelationField } from '../widgets/mapping.js';
import styles from './formStyles.js';

import IdrisSDK from '../../sdk.js';
const sdk = new IdrisSDK();

@withStyles(styles, { withTheme: true })
class ContributorsForm extends React.Component {
    renderAffiliations = (affiliations) => {

      // used by handleContributorFormPersonChange()
    this.affiliation_fields = affiliations.fields;

      const { classes } = this.props;
        const affiliationFields = affiliations.fields.map( (affiliation, index) => (
          <div className={classes.formFieldRow} key={index}>
            <Fields names={[`${affiliation}.group_id`, `${affiliation}._group_name`]}
                    component={mappedRelationField}
                    placeholder="Affiliation"
                    kind="group"
                    className={classes.flex}/>
            <IconButton aria-label="Delete"
			className={classes.RelationButton}
			onClick={() => affiliations.fields.remove(index)}>
	      <DeleteIcon />
	    </IconButton>
            <IconButton aria-label="Add"
			className={classes.RelationButton}
			onClick={() => affiliations.fields.insert(index, {})}>
	      <AddIcon />
	    </IconButton>
          </div>));

      return (
	<div className={classes.formItem} >
          {affiliationFields}
          <div>
            <Button aria-label="add" onClick={() => affiliations.fields.push({})} >
              <AddIcon /> Add Affiliation
            </Button>
          </div>
        </div>);
    }

  handleContributorFormPersonChange = (person_id) => {
    // the person id of the contributor changed, remove all affiliations
    this.affiliation_fields.removeAll();
    sdk.recordList('membership', '', {person_id: person_id,
                                      start_date: this.props.workDateIssued || ''})
      .then(response => response.json(),
            error => {console.log('RelationField Error: ' + error)})
      .then(data => {
        if (data.status === 'ok'){
          for (const s of data.snippets[0].groups) {
            this.affiliation_fields.push(
              {'group_id': s.id, '_group_name': s.name})
          };
        }});
  }

  render() {
    const { classes, settings, field, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
        <div className={classes.formFieldRow}>
             <Field name={`${field}.role`}
                    component={mappedSelect}
                    options={settings.contributor_role}
                    label="Role"
                    className={classes.flex}
                    InputLabelProps={{shrink: true}}/>
             <span className={classes.gutter}> </span>
             <Fields names={[`${field}.person_id`, `${field}._person_name`]}
                    component={mappedRelationField}
                    onRelationChange={this.handleContributorFormPersonChange}
                    placeholder="Person"
                    kind="person"
                     className={classes.flex}/>
	     <span className={classes.gutter_text}> or </span>
             <Fields names={[`${field}.group_id`, `${field}._group_name`]}
                    component={mappedRelationField}
                    placeholder="Organisation"
                    kind="group"
                    className={classes.flex}/>
        </div>
        <div className={classes.formFieldRow}>
              <FieldArray name={`${field}.affiliations`}
                          component={this.renderAffiliations}/>
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
      </div>
    );

  }
}
export default ContributorsForm;
