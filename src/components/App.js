import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import { LinearProgress } from 'material-ui/Progress';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import PersonIcon from 'material-ui-icons/Person';
import GroupIcon from 'material-ui-icons/Group';
import FaceIcon from 'material-ui-icons/Face';
import { Link, Switch, Route, withRouter } from 'react-router-dom';
import Snackbar from 'material-ui/Snackbar';
import CloseIcon from 'material-ui-icons/Close';

import PersonRecord from './PersonRecord';
import GroupRecord from './GroupRecord';
import UserRecord from './UserRecord';
import LoginForm from './LoginForm';

import { getAppTitle, getSideBarOpen, getFlashMessage, getAppState, getCustomTheme,
         getShowProgress, getRedirectURL, getLoggedInUser, getLoginState } from '../selectors';
import { openSideBar, closeSideBar, initializeApp, flashMessage, setRedirectURL,
         setUser, updateLoginState, doLogin } from '../actions';


const styles = {
  root: {
    width: '100%',
  },
  toolbarTitle: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  drawerPaper: {
    width: 240
  },
  drawerHeader: {
    height: 86,
    marginTop:24,
    alignItems: 'center',
    padding: '0 8px',
  },
  appBarWithProgress: {
    marginTop: -5
  }
};

@withStyles(styles)
class App extends Component {

    componentDidMount() {
        this.props.initializeApp();
    }

    toggleSideBar = () => {
        if (this.props.sideBarOpen) {
            this.props.closeSideBar();
        } else {
            this.props.openSideBar();
        }
    }

  handleFlashClose = () => {
      this.props.flashMessage(null);
  }

  renderFlash(){
      const { classes, flash} = this.props;
      return <Snackbar anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
          }}
          open={flash !== null}
          autoHideDuration={3000}
          onClose={this.handleFlashClose}
          SnackbarContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{flash}</span>}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleFlashClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
  }

    logOut = () => {
        this.props.setUser({user:null, token:null});
    }

    render() {
        const { classes, title, sideBarOpen, isInitialized, customTheme,
                showProgress, flash, redirectURL, loggedInUser, loginState } = this.props;
        if (!isInitialized){
            return (<LinearProgress />);
        }
        if (redirectURL){
            this.props.history.push(redirectURL);
            this.props.setRedirectURL(null);
        }
        const theme = createMuiTheme({
            palette: {
                primary: customTheme.primary,
                accent: customTheme.accent
            }
        });

        return (
          <MuiThemeProvider theme={theme}>
          <div className={classes.root}>
            { flash !== null ? this.renderFlash() : null}
            {showProgress? <LinearProgress/>: null}
            <AppBar position="static" className={showProgress? classes.appBarWithProgress: null}>
              <Toolbar>
                <IconButton className={classes.menuButton} color="contrast" aria-label="Menu" onClick={this.toggleSideBar}>
                  <MenuIcon />
                </IconButton>
                <Typography type="title" color="inherit" className={classes.toolbarTitle} noWrap>
                {title}
                </Typography>
                {loggedInUser === null?
                 <LoginForm {...loginState}
                            onChange={this.props.updateLoginState}
                            onLogin={this.props.doLogin} />:
                 <Button color="contrast" onClick={this.logOut}>Logout</Button>}
              </Toolbar>
            </AppBar>
            <Drawer open={sideBarOpen}
                    onRequestClose={this.toggleSideBar}
                    classes={{
                      paper: classes.drawerPaper,
                    }}>
              <div className={classes.drawerHeader}>
                <div>
                  <Typography type="display1">Caleido</Typography>
                </div>
                <Typography type="caption">v 0.3.1</Typography>
              </div>
              <div tabIndex={0}
                   role="button"
                   onClick={this.toggleSideBar}
                   onKeyDown={this.toggleSideBar}>
                <Divider />
                <List>
                  <ListItem button to="/record/person" component={Link}>
                    <ListItemIcon>{<PersonIcon/>}</ListItemIcon>
                    <ListItemText primary={'Person'} />
                  </ListItem>
                  <ListItem button to="/record/group" component={Link}>
                    <ListItemIcon>{<GroupIcon/>}</ListItemIcon>
                    <ListItemText primary={'Group'} />
                  </ListItem>
                  <ListItem button to="/record/user" component={Link}>
                    <ListItemIcon>{<FaceIcon/>}</ListItemIcon>
                    <ListItemText primary={'User'} />
                  </ListItem>
                </List>
                <Divider />
              </div>
            </Drawer>
            <Switch>
              <Route exact path="/record/person" component={PersonRecord} />
              <Route path="/record/person/:id" component={PersonRecord} />
              <Route exact path="/record/group" component={GroupRecord} />
              <Route path="/record/group/:id" component={GroupRecord} />
              <Route exact path="/record/user" component={UserRecord} />
              <Route path="/record/user/:id" component={UserRecord} />
            </Switch>
          </div>
          </MuiThemeProvider>
        )
    }
}


const mapStateToProps = state => {
    return {
        title: getAppTitle(state),
        sideBarOpen: getSideBarOpen(state),
        isInitialized: getAppState(state) === 'initialized',
        customTheme: getCustomTheme(state),
        showProgress: getShowProgress(state),
        flash: getFlashMessage(state),
        redirectURL: getRedirectURL(state),
        loggedInUser: getLoggedInUser(state),
        loginState: getLoginState(state)
    };
}

const mapDispatchToProps = dispatch => {
    return {
        openSideBar: () => {dispatch(openSideBar())},
        closeSideBar: () => {dispatch(closeSideBar())},
        initializeApp: () => {dispatch(initializeApp())},
        flashMessage: (message) => {dispatch(flashMessage(message))},
        setRedirectURL: (url) => {dispatch(setRedirectURL(url))},
        setUser: (user) => {dispatch(setUser(user))},
        updateLoginState: (state) => {dispatch(updateLoginState(state))},
        doLogin: (user, password) => {dispatch(doLogin(user, password))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
