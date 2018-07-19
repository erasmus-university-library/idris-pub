import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, FieldArray } from 'redux-form'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import NetworkCheckIcon from '@material-ui/icons/NetworkCheck';
import Badge from '@material-ui/core/Badge';
import Chip from '@material-ui/core/Chip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';


import { mappedTextField, mappedSelect } from '../widgets/mapping.js';
import styles from './formStyles.js';
@withStyles(styles, { withTheme: true })
class MeasuresForm extends React.Component {
  render(){
    const { classes, settings, fields, field, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
	  <Field name={`${field}.type`}
		 component={mappedSelect}
		 options={settings.measure_types}
		 label="Type"
		 className={classes.measureTypeSelect}/>
	  <span className={classes.gutter}> </span>
	  <Field name={`${field}.value`}
		 component={mappedTextField}
		 label="Value"
		 className={classes.flex}/>
	</div>
      </div>)}
}
export default MeasuresForm;
