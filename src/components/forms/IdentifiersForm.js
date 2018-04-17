import React from 'react';
import { withStyles } from 'material-ui/styles';
import { Field, FieldArray } from 'redux-form'
import DeleteIcon from 'material-ui-icons/Delete';
import AddIcon from 'material-ui-icons/Add';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import Chip from 'material-ui/Chip';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import FingerprintIcon from 'material-ui-icons/Fingerprint';
import Badge from 'material-ui/Badge';
import ExpansionPanel, {
  ExpansionPanelDetails,
  ExpansionPanelSummary,
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Card, { CardActions, CardContent } from 'material-ui/Card';


import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class IdentifiersForm extends React.Component {


    getErrorCount() {
        if (!this.props.errors || !this.props.errors.identifiers){
            return 0
        }
        let errorCount = 0;
        for (const error of Object.values(this.props.errors.identifiers)){
          for (const field of ['type', 'value']){
              if (error[field] !== undefined){
                errorCount += 1;
              }
          }
        }
        return errorCount
    }

    renderIdentifiers = (identifiers) => {
        const { classes, typeOptions } = this.props;
        return (<div>
              {identifiers.fields.map((identifier, identifierIndex) =>
           <div key={identifierIndex} className={classes.formItem}>
             <Field name={`${identifier}.type`} component={mappedSelect} options={typeOptions} label="Type" className={classes.identifierTypeSelect}/>
             <span className={classes.gutter}> </span>
             <Field name={`${identifier}.value`} component={mappedTextField} label="Value (identifier)" className={classes.flex}/>
             <IconButton aria-label="Delete" onClick={() => identifiers.fields.remove(identifierIndex)}><DeleteIcon /></IconButton>
           </div>)}
              <div className={classes.fabButtonRight}>
              <Button color="primary" aria-label="add" onClick={() => identifiers.fields.push({})} >
                <AddIcon /> Add Identifier
              </Button>
              </div>
            </div>)

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
        const { classes, onAccordionClicked, open, formValues } = this.props;
        const errorCount = this.getErrorCount();
        const identifierCount = (formValues || []).length;
        return (
          <ExpansionPanel expanded={open} onChange={onAccordionClicked} CollapseProps={{ unmountOnExit: true }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <ListItemIcon>{ errorCount > 0 ? <Badge badgeContent={errorCount} color="primary" classes={{colorPrimary: classes.errorBGColor}}><FingerprintIcon /></Badge>: <FingerprintIcon />}</ListItemIcon>
              <ListItemText primary="Identifiers" />
            {identifierCount?<Chip label={identifierCount} align="right" key={identifierCount}/>:null}
            <div/>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.editorPanel}>
          <Card className={classes.editorCard}>
          <CardContent>
          <FieldArray name="identifiers" component={this.renderIdentifiers} />
        </CardContent>
          <CardActions>
          <Button type="submit" color="primary">
          Update
          </Button>
          </CardActions>
          </Card>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        );
    }
}
export default IdentifiersForm;
