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
      /*marginBottom: theme.spacing.unit*2*/
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
  gutter_text: {
    margin: theme.spacing.unit * 3
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
  gutteredRightField: {
    marginLeft: theme.spacing.unit,
  },
  gutteredLeftField: {
    marginRight: theme.spacing.unit,
  },
  guttered: {
    marginRight: theme.spacing.unit,
    marginLeft: theme.spacing.unit,
  },

  formItem: {
      width: '100%',
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
  singlePadding: {
    padding: theme.spacing.unit * 1
  },
  doublePadding: {
    padding: theme.spacing.unit * 2
  },
  RecordAccordionContainer: {
    paddingTop: theme.spacing.unit * 2
  },
  RecordAccordionHeading: {
    fontSize: theme.typography.pxToRem(15),
  },
  RecordAccordionSecondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  RecordAccordionColumn: {
    flexBasis: '20%',
  },
  SaveButton: {
    position: 'fixed',
    left: '100%',
    top: '100%',
    marginLeft: -70,
    marginTop: -70
  },
  RelationButton: {
    marginTop: '8px',
    width: '40px',
    height: '40px'
  },
  FullStepper: {
    padding: 0,
  },
  processing : {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 340
  },
  MaterialAddStep: {
    minHeight: 340,
    minWidth: 510
  },
});
export default styles
