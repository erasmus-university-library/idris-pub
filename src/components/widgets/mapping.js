import React from 'react';
import TextField from 'material-ui/TextField';
import Select from 'material-ui/Select';
import { MenuItem } from 'material-ui/Menu';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';

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