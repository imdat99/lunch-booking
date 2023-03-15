import { Card } from '@mui/material'
import React from 'react'

type Props = {
  children: React.ReactElement
}

const CardComponent: React.FC<Props> = (props) => {
  return <Card className="p-4 rounded-md mb-4">{props.children}</Card>
}
export default CardComponent
