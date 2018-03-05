import React from 'react';
import { withStyles } from 'material-ui/styles';

import Typography from 'material-ui/Typography';

import { Link } from 'react-router-dom';

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
});

function Citation(props) {
    const { classes, title, authors, affiliations } = props;
    return (<div>
        <Typography type="caption">
                {authors.map((author, index) => (
                    [<Link className={classes.link}
                             to={`/record/person/${author.id}`}
                             onClick={(e) => (e.stopPropagation())}>{author.name}</Link>,
                    authors.length === index+1? null: '⸱ '
                    ]))}
        </Typography>
        <Typography type="body2" >{title}</Typography>
        <Typography type="body1">
                {affiliations.map((affiliation, index) => (
                    [<Link className={classes.link}
                             to={`/record/group/${affiliation.id}`}
                             onClick={(e) => (e.stopPropagation())}>{affiliation.name}</Link>,
                    affiliations.length === index+1? null: '⸱ '
                    ]))}
        </Typography>
        </div>);
}
export default withStyles(styles)(Citation);