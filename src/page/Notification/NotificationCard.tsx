import { Link } from 'react-router-dom'
import { Card, CardHeader, Avatar } from '@mui/material'
import { ReactNode } from 'react'

interface NotificationCardProps {
  link: string
  time: string
  content: ReactNode
  isRead: boolean
  avatarSrc: string
  onClick?: () => void
}

export default function NotificationCard(props: NotificationCardProps) {
  return (
    <Link to={props.link} onClick={props.onClick}>
      <Card
        sx={{
          margin: 'auto',
          height: '5.87rem',
          borderRadius: '0.375rem',
          width: '100%',
          padding: '0.93rem',
          paddingBottom: '0.688rem',
          backgroundColor: props.isRead ? '#ccc' : '#FFFFFF',
          // boxShadow:"0 0.25rem rgba(0, 0, 0, 0.3)"
        }}
      >
        <CardHeader
          sx={{ padding: '0px' }}
          classes={{
            avatar: 'mr-[1.25rem]',
            title: 'text-[0.875rem] font-normal mb-[0.625rem] leading-[1.106rem] text-black',
            subheader: 'text-[0.875rem] font-normal leading-[1.106rem] text-black',
          }}
          avatar={
            <Avatar
              sx={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
              }}
              src={props.avatarSrc}
            >
              R
            </Avatar>
          }
          title={props.time}
          subheader={props.content}
        />
      </Card>
    </Link>
  )
}
