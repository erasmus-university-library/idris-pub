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
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '100%'
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