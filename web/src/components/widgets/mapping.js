import React from 'react';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';

import _ from 'lodash';

import RelationField from './Relation.js';
import FileUploadField from './FileUpload.js';

export const mappedFileUpload = (props) => {
  const handleUpload = (props) => (blobInfo) => {
    props.input.onChange(blobInfo.id)
    if (props.onUpload !== undefined){
      props.onUpload(blobInfo);
    }
  }

  return <FileUploadField value={props.input.value} name={props.blobName} onUpload={handleUpload(props)}/>
}
export const mappedRelationField = (props) => {
  const error = props.error;
  const id_input = _.get(props, props.names[0]).input;
  const label_input = _.get(props, props.names[1]).input;
  return (
    <RelationField kind={props.kind}
		   error={error||null}
		   placeholder={props.placeholder}
		   value={id_input.value}
		   label={label_input.value}
		   filters={props.filters || {}}
		   onRelationChange={props.onRelationChange || null}
		   onChange={(id, label) => {id_input.onChange(id); label_input.onChange(label);}}/>)
}
export const mappedTextField = ({input, label, className, multiline, type, meta, ...other}) => {
    return <TextField label={meta.error || label}
                      error={meta.invalid}
                      id={input.name}
                      type={type}
                      multiline={multiline || false}
                      value={input.value}
                      onChange={input.onChange}
                      className={className}
                      {...other}/>
}
export const mappedSelect = ({input, label, disabled, description, margin, options, className, meta}) => {
    return (<FormControl disabled={disabled || false}>
        {label ? <InputLabel htmlFor={input.name}>{label}</InputLabel>: null}
        <Select label={meta.error || label}
                    error={meta.invalid}
                    input={<Input id={input.name}/>}
                    value={input.value}
                    onChange={input.onChange}
                    className={className}>
        {options.map((option) => <MenuItem value={option.id} key={option.id}>{option.label}</MenuItem>)}
        </Select>
        {(description || null) === null? <FormHelperText>{description}</FormHelperText>: null}
        </FormControl>)
}
