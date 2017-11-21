const styles = theme => ({
  flexContainer: {
    display:'flex'
  },
  flex: {
    flex: 1,
  },
  gutter: {
    margin: theme.spacing.unit
  },
  card: {
    minWidth: `calc(100% - ${theme.spacing.unit * 6}px)`,
    backgroundColor: 'white',
    padding: theme.spacing.unit * 3,
    paddingTop: theme.spacing.unit,
    height: 'calc(100% - 56px)',
    marginTop: theme.spacing.unit * 3,
    [theme.breakpoints.up('sm')]: {
      content: {
        height: 'calc(100% - 64px)',
        marginTop: 64,
      },
    },
  },

});
export default styles
