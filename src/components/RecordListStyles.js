const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 600,
  },
  pagination: {
    flex: 0,
  },
  textField: {
    margin: theme.spacing.unit,
    marginBottom: theme.spacing.unit - 1,
    width: '200px'
  },
  formControl: {
    margin: theme.spacing.unit,
    width: '100%',
  },
  withoutLabel: {
    marginTop: theme.spacing.unit * 3,
  },
});

export default styles