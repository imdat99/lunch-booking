import { TextField, TextFieldProps } from '@mui/material'
import { styled } from '@mui/material/styles'
import { InputAttributes } from 'react-number-format'
const TextFieldStyled = styled(TextField)<TextFieldProps>(({ theme }) => ({
  '& .MuiFormLabel-root': {
    ...theme.typography.subtitle1,
  },
})) as React.ComponentType<InputAttributes>
export default TextFieldStyled
