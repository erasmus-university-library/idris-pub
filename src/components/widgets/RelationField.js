import React from 'react';
import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import { MenuItem } from 'material-ui/Menu';
import { withStyles } from 'material-ui/styles';

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

    fetchRecordSearch = (kind, query='', offset=0, limit=10) => {
        sdk.recordSearch(kind, query, offset, limit)
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

    renderInput = (inputProps) => {
        const { classes, autoFocus, value, label, ref, ...other } = inputProps;

        const value_id = parseInt(value, 10)
        const value_label = this.state.labels[value_id];
        const id_input = this.props.id_input(this.props);
        const label_input = this.props.label_input(this.props);

        if (value_id > 0 && value_label){

            setTimeout(() => {
                id_input.onChange(value_id);
                label_input.onChange(value_label);
            }, 1);

        }


        return (<div>
            <TextField
            autoFocus={autoFocus}
            className={classes.textField}
            id={label_input.name}
            value={value_label || value}
            label={label}
            inputRef={ref}
            InputLabelProps={{
                shrink: true,
            }}
            InputProps={{
                classes: {
                    input: classes.input,
                },
                ...other,
                placeholder: label_input.value
            }}
            /></div>
        );
    }

    renderSuggestion = (suggestion, { query, isHighlighted }) => {
        const matches = match(suggestion.name, query);
        const parts = parse(suggestion.name, matches);

        return (
            <MenuItem selected={isHighlighted} component="div">
            <div>
            {parts.map((part, index) => {
                return part.highlight ? (
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

  handleChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  render() {
    const { classes } = this.props;
      console.log('render ' + this.state.value)
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
          value: this.state.value,
          input: this.props.input,
          onChange: this.handleChange,
        }}
      />
    );
  }
}

export default withStyles(styles)(RelationField);