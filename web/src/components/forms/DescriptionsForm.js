import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Fields, FieldArray } from 'redux-form'
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import FormatQuoteIcon from '@material-ui/icons/FormatQuote';
import Badge from '@material-ui/core/Badge';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
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
class DescriptionsForm extends React.Component {
  render() {
    const { classes, settings, fields, field, fieldIndex } = this.props;
    return (
      <div key={fieldIndex} className={classes.formItem}>
	<div className={classes.formFieldRow}>
          <Field name={`${field}.type`}
                 component={mappedSelect}
                 options={settings.description_types}
                 label="Description Type"
                 className={classes.dateField}
                 InputLabelProps={{shrink: true}}/>
          <span className={classes.gutter}> </span>
          <Field name={`${field}.format`}
                 component={mappedSelect}
                 options={settings.description_formats}
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
      </div>
        );

    }
}
export default DescriptionsForm;
