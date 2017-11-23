import React, { Component } from 'react';
import { connect } from 'react-redux'
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import { LinearProgress } from 'material-ui/Progress';
import Snackbar from 'material-ui/Snackbar';
import CloseIcon from 'material-ui-icons/Close';

import styles from './LayoutStyles.js';

import UserContainer from '../containers/UserContainer';
import FilteredRecordTypesContainer from '../containers/FilteredRecordTypesContainer';
import FilteredRecordListingContainer from '../containers/FilteredRecordListingContainer';
import RecordEditor from '../containers/RecordEditor'

@withStyles(styles, { withTheme: true })
class Layout extends Component {
  renderFlash(){
      const { classes, flash} = this.props;
      return <Snackbar anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
          }}
          open={flash !== null}
          autoHideDuration={3000}
          onRequestClose={this.handleFlashClose}
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

  handleFlashClose = () => {
      this.props.changeFlashMessage(null);
  }
  render() {
      const { classes, theme, isSideBarOpen, userLoggedIn, title,
              openSideBar, closeSideBar, flash,
              isDetailOpen } = this.props;
      let progress = null;
      if (this.props.showProgress){
          progress = <LinearProgress />;
      }
    return (
      <div className={classes.root}>
        { flash !== null ? this.renderFlash() : null}
        <div className={classes.appFrame}>
          <AppBar position="static"
                  className={classNames(classes.appBar, isSideBarOpen && classes.appBarShift)}>
            <Toolbar disableGutters={false}>
              <IconButton
                color="contrast"
                aria-label="open drawer"
                onClick={openSideBar}
                className={classNames(classes.menuButton,
                                      (isSideBarOpen || !userLoggedIn)&& classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography type="title" color="inherit" noWrap className={classes.flex}>
                {title}
              </Typography>
              <UserContainer />
            </Toolbar>
          {progress}
          </AppBar>
          <Drawer
            type="persistent"
            classes={{
              paper: classes.sideBarPaper,
            }}
            open={isSideBarOpen}
          >
            <div className={classes.drawerInner}>
              <div className={classes.sideBarHeader}>
                <IconButton onClick={closeSideBar}>
                  {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </div>
              <Divider />
              <FilteredRecordTypesContainer />
            </div>
          </Drawer>
          <main className={classNames(classes.content,
                                      isSideBarOpen && classes.contentShift,
                                      isDetailOpen && classes.contentShiftDetail)}>
              { userLoggedIn ? <FilteredRecordListingContainer /> : null }
          </main>
          <Drawer
            anchor="right"
            type="persistent"
            classes={{
              paper: classes.detailPaper,
            }}
            open={isDetailOpen}
          >
            <div className={classes.detailInner}>
              <RecordEditor />
            </div>
          </Drawer>
        </div>
      </div>
    );
  }
}


class LayoutContainer extends Component {
    render() {
        return <Layout {...this.props}/>
    }
}

const mapStateToProps = state => {
    return {sideBar: {open: false},
            authenticatedUserId: null};
}

const mapDispatchToProps = dispatch => {
    return {
    };
}


export default connect(mapStateToProps, mapDispatchToProps)(LayoutContainer);
