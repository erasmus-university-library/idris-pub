import React from 'react';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import { Link } from 'react-router-dom';


import CaleidoSDK from '../../sdk.js';
const sdk = new CaleidoSDK();


const styles = theme => ({
  container: {
    flexGrow: 1,
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 3,
    zIndex:1,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
  textField: {
    width: '100%',
  },
});



class RelationField extends React.Component {
    state = {
        value: '',
        labels: {},
        suggestions: [],
    };

    fetchRecordSearch = (kind, query='', filters=null, offset=0, limit=10) => {
        if (query === '-1'){
            return
        }

        if (this.timeoutId){
            // a fetch is in already scheduled with a timeout, cancel it
            clearTimeout(this.timeoutId);

        }


        const fetchCallBack = () => {
        sdk.recordSearch(kind, query, filters || this.props.filters, offset, limit)
           .then(response => response.json(),
                 error => {console.log('RelationField Error: ' + error)})
           .then(data => {
               if (data.status === 'ok'){
                   const labels = {};
                   for (const s of data.snippets) {
                       labels[s.id] = s.name;
                   }
                   this.setState({suggestions: data.snippets,
                                  labels: labels});
               };
           });
        }

        this.timeoutId = setTimeout(fetchCallBack, 400);

    }

    renderInput = (inputProps) => {
        const { classes, autoFocus, value, label, placeholder, ref, kind, ...other } = inputProps;
        return (<div>
            <TextField
            autoFocus={autoFocus}
            className={classes.textField}
            value={this.state.label || label}
            label={placeholder}
            inputRef={ref}
            InputLabelProps={{
                shrink: true,
            }}
            InputProps={{
                classes: {
                    input: classes.input,
                },
                ...other,
                placeholder: placeholder,
                endAdornment: (
                    <InputAdornment position="end">
                      <IconButton  disabled={label === ''}
                                   to={`/record/${kind}/${value}`}
                                   component={Link}>
                        <OpenInNewIcon/>
                      </IconButton>
                    </InputAdornment>
                )

            }}
            />
            </div>
        );
    }

    renderSuggestion = (suggestion, { query, isHighlighted }) => {
        const matches = match(suggestion.name, this.state.label);
        const parts = parse(suggestion.name, matches);
        return (
            <MenuItem selected={isHighlighted} component="div">
            <div>
            <div>
            {parts.map((part, index) => {
                return !part.highlight ? (
                    <span key={String(index)} style={{ fontWeight: 300 }}>
                    {part.text}
                    </span>
                ) : (
                    <strong key={String(index)} style={{ fontWeight: 500 }}>
                    {part.text}
                    </strong>
                );
            })}

            </div>
            {suggestion.info?<Typography variant="caption">{suggestion.info}</Typography>:null}
            </div>
            </MenuItem>
        );
    }

    renderSuggestionsContainer = (options) => {
        const { containerProps, children } = options;

        return (
            <Paper {...containerProps} square>
            {children}
            </Paper>
        );
    }



  getSuggestionValue = (suggestion) => {
      return suggestion.id.toString();
  }


  handleSuggestionsFetchRequested = ({ value }) => {
      this.fetchRecordSearch(this.props.kind, value);
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  handleChange = (event, change) => {

    if (change.method === 'type'){
        this.setState({
            label: change.newValue,
        });
    }
    if (change.method === 'click'){
    this.setState({
      label: this.state.labels[change.newValue],
      value: change.newValue
    });
    this.props.onChange(change.newValue, this.state.labels[change.newValue]);

    if (this.props.onRelationChange !== null){
        // call extra handler method to perform optional more high level business logic
        this.props.onRelationChange(change.newValue);
    }
    }
  };

  render() {
    const { classes } = this.props;
      return (
      <Autosuggest
        theme={{
          container: classes.container,
          suggestionsContainerOpen: classes.suggestionsContainerOpen,
          suggestionsList: classes.suggestionsList,
          suggestion: classes.suggestion,
        }}
        renderInputComponent={this.renderInput}
        suggestions={this.state.suggestions}
        onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
        renderSuggestionsContainer={this.renderSuggestionsContainer}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={{
          autoFocus: false,
          classes,
          label: this.props.label,
          kind: this.props.kind,
          value: (this.props.value || -1).toString(),
          placeholder: this.props.placeholder,
          onChange: this.handleChange,
          onSubmit: this.props.onChange,
        }}
      />
    );
  }
}

export default withStyles(styles)(RelationField);
