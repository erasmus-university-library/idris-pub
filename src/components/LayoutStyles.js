const drawerWidth = 260;
const styles = theme => ({
  root: {
    width: '100%',
    height: 800,
    paddingTop: theme.spacing.unit * 3,
    zIndex: 1,
    overflow: 'hidden',
  },
  appFrame: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  appBar: {
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 20,
  },
  flex: {
    flex: 1,
  },
  hide: {
    display: 'none',
  },
  sideBarPaper: {
    position: 'relative',
    height: '100%',
    width: drawerWidth,
  },
  sideBarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  detailPaper: {
    backgroundColor: theme.palette.background.default,
    position: 'relative',
    border:0,
    height: 'calc(100% - 86px)',
    marginTop: 72,
    paddingTop: 18,
    [theme.breakpoints.up('sm')]: {
      content: {
        height: 'calc(100% - 86px)',
        marginTop: 86,
      },
    },
    width: drawerWidth * 3,
  },
  detailInner: {
    padding: theme.spacing.unit * 3,
    marginLeft: -theme.spacing.unit,
    paddingLeft: theme.spacing.unit,
    marginTop: -theme.spacing.unit,
    paddingTop: theme.spacing.unit,
  },
  content: {
    width: '100%',
    marginLeft: -drawerWidth,
    marginRight: -drawerWidth *3,
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      content: {
        height: 'calc(100% - 64px)',
        marginTop: 64,
      },
    },
  },
  contentShift: {
    marginLeft: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  contentShiftDetail: {
    marginRight: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
});
export default styles