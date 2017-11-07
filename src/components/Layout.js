import React, { Component } from 'react';
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

import styles from './LayoutStyles.js'
import UserMenu from './UserMenu.js'
import LoginForm from './LoginForm.js'

@withStyles(styles, { withTheme: true })
class Layout extends Component {

  render() {
    const { classes, theme } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar position="static"
                  className={classNames(classes.appBar, this.props.sideBar.open && classes.appBarShift)}>
            <Toolbar disableGutters={false}>
              <IconButton
                color="contrast"
                aria-label="open drawer"
                onClick={this.props.action.sideBar.onOpen}
                className={classNames(classes.menuButton,
                                      (this.props.sideBar.open || !this.props.authenticatedUserId)&& classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography type="title" color="inherit" noWrap className={classes.flex}>
                {this.props.title}
              </Typography>
              <UserMenu onLoginClick={this.props.action.loginForm.onOpen}/>
            </Toolbar>
          </AppBar>
          <Drawer
            type="persistent"
            classes={{
              paper: classes.drawerPaper,
            }}
            open={this.props.sideBar.open}
          >
            <div className={classes.drawerInner}>
              <div className={classes.drawerHeader}>
                <IconButton onClick={this.props.action.sideBar.onClose}>
                  {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
              </div>
              <Divider />
            </div>
          </Drawer>
          <main className={classNames(classes.content, this.props.sideBar.open && classes.contentShift)}>
            <LoginForm {...this.props.loginForm} {...this.props.action.loginForm} />
            <Typography type="body1" noWrap>
              {'You think water moves fast? You should see ice.'}
            </Typography>
          </main>
        </div>
      </div>
    );
  }
}

export default Layout;
