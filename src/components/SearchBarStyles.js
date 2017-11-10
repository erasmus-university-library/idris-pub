const styles = theme => ({
  outsideContainer: {
    width: '100%',
    height: '70%',
  },
  insideContainer: {
    marginTop: '0 !important',
    height: '100%',
  },
  inputBox: {
    flexGrow: '1 !important',
  },
  input: {
    width: '100%',
    border: 0,
    '&:focus': {
      outline: 0,
    },
  },
  iconContainer: {
    marginLeft: 8,
    paddingRight: '0 !important',
  }
});

export default styles