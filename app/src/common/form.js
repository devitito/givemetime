import React, { PropTypes } from 'react'
import { TextField as FormTextField } from 'material-ui'

export function TextField ({ input, label, disabled, value, multiLine, rows }) {
    const width = multiLine ? '500px' : '256px'
    return (
        <FormTextField
            floatingLabelText={label}
            disabled={disabled}
            defaultValue={value}
            multiLine={multiLine}
            rows={rows}
            className='text_field'
            style={{ width: width, display: 'flex', alignItems: 'center', flexDirection: 'column' }}
            {...input}
        />
    )
}

TextField.propTypes = {
    input: PropTypes.object.isRequired,
    label: PropTypes.string,
    disabled: PropTypes.bool,
    multiLine: PropTypes.bool,
    rows: PropTypes.number,
    value: PropTypes.any,
}
