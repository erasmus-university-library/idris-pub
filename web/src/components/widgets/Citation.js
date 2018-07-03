import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import { CiteProc } from '../../sdk.js';
import Typography from '@material-ui/core/Typography';
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
  cslContainer: {
    maxWidth: '50%'
  }
});


class Citation extends React.Component {
  render(){
    const { classes, citation } = this.props;
    let frag = citeProc.renderCitation(citation);
    return <Typography align="justify">{frag}</Typography>
    }
}
export default withStyles(styles)(Citation)
