import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field } from 'redux-form'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import StyleIcon from '@material-ui/icons/Style';
import Badge from '@material-ui/core/Badge';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';

import { mappedTextField, mappedSelect } from '../widgets/mapping.js';

import styles from './formStyles.js';

@withStyles(styles, { withTheme: true })
class WorkForm extends React.Component {
    shouldComponentUpdate(nextProps, nextState){
        if (this.props.open === false && nextProps.open === false){
            return false;
        }
        return true;
    }

    render(){
      const { classes, onAccordionClicked, open, settings } = this.props;

      return (
        <div className={classes.formItem}>
          <div className={classes.formContainer}>
            <div className={classes.formFieldRow}>
              <Field name="type" component={mappedSelect} options={settings.type} label="Type" className={classes.flex}/>
              <span className={classes.gutter}> </span>
              <Field name="issued" component={mappedTextField} label="Issued Date" type="date" className={classes.dateField} />
            </div>
            <div className={classes.formFieldRow}>
              <Field name="title"
                     component={mappedTextField}
                     label="Title / Name"
                     multiline
                     rowsMax="4"
                     className={classes.flex}/>
            </div>
          </div>
        </div>
      );
    }
}
export default WorkForm;
