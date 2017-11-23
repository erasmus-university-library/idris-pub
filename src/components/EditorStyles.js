const styles = theme => ({
  flexContainer: {
    display:'flex'
  },
  flex: {
    flex: 1,
  },
  fabButtonRight: {
      display: 'flex',
      justifyContent: 'flex-end',
  },
  errorBGColor: {
      backgroundColor: 'rgb(255, 23, 68)',
  },
  gutter: {
    margin: theme.spacing.unit
  },
  collapse: {
      paddingLeft: theme.spacing.unit * 3,
      paddingRight: theme.spacing.unit * 3,
  },
  accountTypeSelect: {
      minWidth: 60,
  },
  editorCard: {
    minWidth: `calc(100% - ${theme.spacing.unit * 6}px)`,
    backgroundColor: 'white',
    padding: 0,
    height: 'calc(100% - 56px)',
    marginTop: theme.spacing.unit * 3,
    [theme.breakpoints.up('sm')]: {
      content: {
        height: 'calc(100% - 64px)',
        marginTop: 64,
      },
    },
  },
  accordionCard: {
      paddingTop: theme.spacing.unit,
      paddingLeft: theme.spacing.unit * 3,
      paddingRight: theme.spacing.unit * 3,
  },
  noPadding: {
      padding: 0,
  },
});
export default styles
