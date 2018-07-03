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
  cslEntry: {
      fontSize: '0.9rem',
      fontWeight: 300,
      lineHeight: 1.5
  },
  formFieldRow: {
      display:'flex',
      marginBottom: theme.spacing.unit*2
  },
  formControlSelect: {
      width: 180
  },
  nobr: {
      whiteSpace: 'nowrap'
  },
  flex: {
    flex: 1,
  },
  refIconLink: {
      width: 40,
      height: 40,
      marginLeft: -10
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
  formContainer: {
    padding: theme.spacing.unit * 2,
    paddingBottom: 0,
  },
  recordBar: {
    paddingLeft: theme.spacing.unit * 2,
    paddingRight: theme.spacing.unit * 2,
  },
  tabContent: {
    margin: theme.spacing.unit * 2
  },
  cardContainer: {
    padding:0
  },
  recordAccordions: {
    padding:theme.spacing.unit * 2
  },
  contributorCard: {
    padding:theme.spacing.unit * 2,
    paddingBottom: 0
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
