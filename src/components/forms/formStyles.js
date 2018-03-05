const styles = theme => ({
  flexContainer: {
    display:'flex'
  },
  link: {
     color: 'black',
     marginRight: '0.5em',
     textDecoration: 'none',
      '&:hover': {
          textDecoration: 'underline'
      }
  },
  formControlSelect: {
      width: 180
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
  formItem: {
      minHeight: 68,
      display: 'flex'
  },
  editorPanel: {
      padding: 0,
      marginTop: -theme.spacing.unit * 2
  },
  editorCard: {
    minWidth: `calc(100%)`,
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
