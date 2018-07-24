import React from 'react';

import { CiteProc } from '../../sdk.js';
import Typography from '@material-ui/core/Typography';
const citeProc = new CiteProc();

class Citation extends React.Component {
  render(){
    const { citation } = this.props;
    let frag = citeProc.renderCitation(citation);
    return <Typography align="justify">{frag}</Typography>
    }
}
export default Citation
