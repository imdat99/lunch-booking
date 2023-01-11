import { Link } from 'react-router-dom'
import { Card, CardHeader, Avatar } from '@mui/material'

interface NotificationCardProps {
  link: string
  time: string
  content: string
  isRead: boolean
}

export default function NotificationCard(props: NotificationCardProps) {
  return (
    <Link to={props.link}>
      <Card
        sx={{
          margin: 'auto',
          height: '5.87rem',
          borderRadius: '0.938rem',
          width: '100%',
          padding: '0.93rem',
          paddingBottom: '0.688rem',
          maxWidth: { xs: '21.87rem', sm: 'unset' },
          backgroundColor: props.isRead ? '#9C9C9C' : '#FFFFFF',
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
              src="src\assets\b11fc369cb613036d5cb9948e0fa9327.jpg"
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
