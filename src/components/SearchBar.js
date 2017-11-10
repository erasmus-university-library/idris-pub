import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import FaceIcon from 'material-ui-icons/Face';
import Layout from 'material-ui/Layout';
import Paper from 'material-ui/Paper';

import styles from './SearchBarStyles.js'

@withStyles(styles)
class SearchBar extends Component {

  render() {
      const { classes } = this.props;

      return (
    <Paper className={classes.outsideContainer}>
      <Layout container align="center" className={classes.insideContainer}>
        <Layout item className={classes.iconContainer}>
          <FaceIcon />
        </Layout>
        <Layout item className={classes.inputBox}>
          <input type="text" className={classes.input} />
        </Layout>
      </Layout>
    </Paper>);
  }
}

export default SearchBar;
