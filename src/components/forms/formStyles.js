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
      minWidth: 120,
  },
  dateField: {
      width: 180,
  },
  editorCard: {
    minWidth: `calc(100%)`,
    padding: 0,
  },
  accordionCard: {
      paddingTop: theme.spacing.unit,
      paddingLeft: theme.spacing.unit * 5,
      paddingRight: theme.spacing.unit * 3,
  },
  noPadding: {
      padding: 0,
  },
});
export default styles
