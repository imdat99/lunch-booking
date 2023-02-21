import { Box } from '@mui/material'
import React, { ReactNode } from 'react'

interface Props {
  className?: string
  children: ReactNode
}

const Wrapper = (props: Props) => {
  return <Box className={props.className || 'px-3 min-w-[325px] max-w-[800px] mx-auto'}>{props.children}</Box>
}

export default Wrapper
