const styles = theme => ({
  root: {
    width: '100%',
    background: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
  checkBox: {
      width: theme.spacing.unit * 2,
      height: theme.spacing.unit * 2,
  }
});

export default styles;