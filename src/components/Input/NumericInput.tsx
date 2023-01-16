import { TextFieldProps } from '@mui/material'
import React from 'react'
import { NumericFormat, NumericFormatProps } from 'react-number-format'

import TextFieldStyled from './StyledTextField'

const TextNumberInput: React.FC<TextFieldProps & NumericFormatProps> = (props) => {
  return (
    <NumericFormat
      customInput={TextFieldStyled}
      variant="filled"
      autoComplete="off"
      {...props}
      onFocus={(event) => {
        event.target.select()
      }}
    />
  )
}
export default TextNumberInput
