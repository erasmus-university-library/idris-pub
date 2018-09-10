import { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';


const styles = {
  root: {
    width: '100%',
  },
};

@withStyles(styles)
class App extends Component {

  render() {
    return 'Literature Listing';
  }
}


const mapStateToProps = state => {
    return {
    };
}

const mapDispatchToProps = dispatch => {
    return {
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
