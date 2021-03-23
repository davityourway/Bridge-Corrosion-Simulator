import React from 'react';

interface PropertyInputProps {
    label: string;
    fieldName: string
    register: any
}

export const PropertyInput: React.FC<PropertyInputProps> = props => <tr>
    <td><label>{props.label}: </label></td>
    <td><input name={`${props.fieldName}.mean`} ref={props.register}/></td>
    <td><input name={`${props.fieldName}.stdev`} ref={props.register}/></td>
    <td><input name={`${props.fieldName}.trunc_low`} ref={props.register}/></td>
    <td><input name={`${props.fieldName}.trunc_high`} ref={props.register}/></td>
</tr>

interface InputProps {
    label: string;
    fieldName: string;
    register: any;
}

export const Input: React.FC<InputProps> = props => <tr>
    <td><label>{props.label}: </label></td>
    <td><input name={props.fieldName} ref={props.register}/></td>
</tr>