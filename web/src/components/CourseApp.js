import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText  from '@material-ui/core/ListItemText';
import SchoolIcon from '@material-ui/icons/School';
import { Link, Switch, Route, withRouter } from 'react-router-dom';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import Chip from '@material-ui/core/Chip';

import LoginForm from './LoginForm';
import CourseRecord from './CourseRecord';

import { getAppHeader, getSideBarOpen, getFlashMessage, getErrorMessage, getAppState, getCustomTheme, getNavigation,
         getShowProgress, getRedirectURL, getLoggedInUser, getLoginState } from '../selectors';
import { openSideBar, closeSideBar, initializeApp, flashMessage, errorMessage, setRedirectURL,
         setUser, updateLoginState, doLogin, courseNavigation } from '../actions';

import logo_img from '../../public/eur_logo.svg';


const styles = {
  root: {
    width: '100%',
  },
  toolbarTitle: {
    flex: 1,
  },
  chip: {
      float: 'right',
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
    color: 'inherit'
  },
  drawerPaper: {
    width: 320
  },
  drawerHeader: {
    height: 86,
    marginTop:24,
    alignItems: 'center',
    padding: '0 8px',
  },
  appBarWithProgress: {
    marginTop: -5
  },
  headerIcon: {
      cursor: 'initial',
      marginTop: -2,
      marginLeft: -10
  }
};

@withStyles(styles)
class App extends Component {

  theme = null;

  componentDidMount() {
    this.props.initializeApp();
  }

  toggleSideBar = () => {
    if (this.props.sideBarOpen) {
      this.props.closeSideBar();
    } else {
      this.props.openSideBar();
      this.props.loadCourseNavigation();
    }
  }

  handleDrawerClose = () => {
    this.props.closeSideBar();
  }

  handleFlashClose = () => {
    this.props.flashMessage(null);
  }
  handleErrorClose = () => {
    this.props.errorMessage(null);
  }

  renderFlash(){
    const { classes, flash} = this.props;
    return (
      <Snackbar anchorOrigin={{vertical: 'bottom',
			       horizontal: 'left',
		}}
                open={flash !== null}
		autoHideDuration={3000}
		onClose={this.handleFlashClose}
		ContentProps={{
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
        />);
  }

  renderError(){
    const { classes, error} = this.props;
    return (
      <Snackbar anchorOrigin={{
		  vertical: 'top',
		  horizontal: 'center',
		}}
		open={error !== null}
		autoHideDuration={3000}
		onClose={this.handleErrorClose}
		ContentProps={{
		  'aria-describedby': 'message-id',
		}}
		message={<span id="message-id">{error}</span>}
		action={[
		    <IconButton
			 key="close"
			 aria-label="Close"
			 color="inherit"
			 className={classes.close}
			 onClick={this.handleErrorClose}
			 >
			<CloseIcon />
		      </IconButton>,
		]}
        />);
  }

  logOut = () => {
    this.props.setUser({user:null, token:null});
  }

    render() {
      const { classes, header, sideBarOpen, isInitialized, customTheme, navigation,
              showProgress, flash, error, redirectURL, loggedInUser, loginState } = this.props;
      if (!isInitialized){
        return <LinearProgress />;
      }

      if (redirectURL){
        this.props.history.push(redirectURL);
        this.props.setRedirectURL(null);
      }

      if (this.theme === null && customTheme !== null){
        this.theme = createMuiTheme({
          palette: {
            primary: customTheme.primary,
            accent: customTheme.accent
          }});
      } else if (this.theme === null && customTheme === null){
	this.theme = createMuiTheme();
      }

      return (
        <MuiThemeProvider theme={this.theme}>
        <div className={classes.root}>
        { flash !== null ? this.renderFlash() : null}
            { error !== null ? this.renderError() : null}
            <AppBar position="sticky" className={showProgress? classes.appBarWithProgress: null}>
              <Toolbar>
                <IconButton className={classes.menuButton} color="default" aria-label="Menu" onClick={this.toggleSideBar}>
                  <MenuIcon />
                </IconButton>
                <Typography variant="title" color="inherit" className={classes.toolbarTitle} noWrap>
            {header.title}
                </Typography>
            {header.seeAlsoURL? <Chip label={header.seeAlsoName} align="right"
                                 className={classes.chip}
                                 onClick={(e) => (this.props.history.push(header.seeAlsoURL))}
                                 onDelete={(e) => (this.props.history.push(header.seeAlsoURL))}
                                 deleteIcon={<OpenInNewIcon />} /> : null}
                {loggedInUser === null?
                 <LoginForm {...loginState}
                            onChange={this.props.updateLoginState}
                            onLogin={this.props.doLogin} />:
                 <Button color="inherit" onClick={this.logOut}>Logout</Button>}
              </Toolbar>
              {showProgress? <LinearProgress />: null}
            </AppBar>
            <Drawer open={sideBarOpen}
                    classes={{
                      paper: classes.drawerPaper,
                    }}>
              <div className={classes.drawerHeader}>
                <div>
                    <img src={logo_img} alt="logo" />
                </div>
                    <IconButton onClick={this.handleDrawerClose} align="right"><ChevronLeftIcon /></IconButton>
              </div>
              <div tabIndex={0}
                   role="button"
                   onClick={this.toggleSideBar}
                   onKeyDown={this.toggleSideBar}>
                <Divider />
                <List dense>
		  {navigation.map((item) => {return ([
                      <ListItem button to={`/group/${item.id}`} component={Link} key={item.id}>
		      <Avatar><SchoolIcon /></Avatar>
		      <ListItemText primary={item.name} secondary={`${item.total} courses`}/>
                      </ListItem>,
		    <Divider inset key={`${item.id}-divider`}/>]);})}
		</List>
              </div>
            </Drawer>
            <Switch>
              <Route exact path="/group/:group_id" component={CourseRecord} />
              <Route exact path="/group/:group_id/add" component={CourseRecord} />
              <Route exact path="/group/:group_id/course/:course_id" component={CourseRecord} />
              <Route exact path="/group/:group_id/course/:course_id/add" component={CourseRecord} />
            </Switch>
          </div>
          </MuiThemeProvider>
        )
    }
}


const mapStateToProps = state => {
    return {
      header: getAppHeader(state),
      sideBarOpen: getSideBarOpen(state),
      isInitialized: getAppState(state) === 'initialized',
      navigation: getNavigation(state),
      customTheme: getCustomTheme(state) || null,
      showProgress: getShowProgress(state),
      flash: getFlashMessage(state),
      error: getErrorMessage(state),
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
      loadCourseNavigation: () => {dispatch(courseNavigation())},
      flashMessage: (message) => {dispatch(flashMessage(message))},
      errorMessage: (message) => {dispatch(errorMessage(message))},
      setRedirectURL: (url) => {dispatch(setRedirectURL(url))},
      setUser: (user) => {dispatch(setUser(user))},
      updateLoginState: (state) => {dispatch(updateLoginState(state))},
      doLogin: (user, password) => {dispatch(doLogin(user, password))},
    };
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
