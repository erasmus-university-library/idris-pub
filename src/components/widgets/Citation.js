import React from 'react';
import { withStyles } from 'material-ui/styles';

import { CiteProc } from '../../sdk.js';
const citeProc = new CiteProc();

const styles = theme => ({
  link: {
     color: '#00000080',
     marginRight: '0.5em',
     whiteSpace: 'nowrap',
     textDecoration: 'none',
      '&:hover': {
          textDecoration: 'underline'
      }
  },
  cslEntry: {
      fontSize: '0.9rem',
      fontWeight: 300,
      lineHeight: 1.5
  },

});


class Citation extends React.Component {
    render(){
    const { classes, citation } = this.props;
        return <div className={classes.cslEntry}>{citeProc.renderCitation(citation)}</div>
    }
}
export default withStyles(styles)(Citation)
