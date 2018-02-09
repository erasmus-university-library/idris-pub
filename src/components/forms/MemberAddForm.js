import React from 'react';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import AddIcon from 'material-ui-icons/Add';

import Relation from '../widgets/Relation';

const styles = theme => ({
    padded: {
        padding: theme.spacing.unit * 2,
    },
    memberAdd: {
        float:'left'
    },
    relationField: {
        width: 300
    },
    button: {
        margin: theme.spacing.unit
    }
});


@withStyles(styles, { withTheme: true })
class MemberAddForm extends React.Component {
    state = {
        value: null,
    };




    handleSubmit = (event) => {
        console.log('submit')
        console.log(event);
    }

    render() {
        const { classes, handleSubmit } = this.props;

        return (<div className={classes.padded}>
            <div className={classes.memberAdd}>
            <Relation kind="person" placeholder="Add Member" label=""
             onChange={(value) => this.setState({'value': value})} classes={{textField: classes.relationField}} />
            </div>
            <Button color="primary"
                    className={classes.button}
                    disabled={this.state.value === null}
                    onClick={this.handleSubmit}>
              <AddIcon /> Add Member
            </Button>

            </div>);
    }
}
export default MemberAddForm;
