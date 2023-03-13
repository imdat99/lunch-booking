import { Link } from 'react-router-dom'
import { Card, CardHeader, Avatar, IconButton, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem, Button, Popover } from '@mui/material'
import { ReactNode } from 'react'
import { MoreHorizOutlined } from '@mui/icons-material'
import React from 'react'
import { INoti, User } from '@app/server/firebaseType'
import { formatDate } from '@app/libs/functions'
import { removeNotiUser, setUserReadNoti } from '@app/stores/noti'
import { useAppDispatch } from '@app/stores/hook'

interface NotificationCardProps {
  link: string
  content: ReactNode
  isRead: boolean
  avatarSrc: string
  notiInfo: INoti
  userInfo: User
  onClick?: () => void
}

export default function NotificationCard(props: NotificationCardProps) {
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  const handleClose = (event?: Event) => {
    if (event && anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const markHaveRead = async () => {
    dispatch(setUserReadNoti(props.userInfo.uid!, props.notiInfo))
    handleClose()
  }

  const removeNoti = () => {
    dispatch(removeNotiUser(props.userInfo.uid!, props.notiInfo))
    handleClose()
  }

  return (
    <>
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
          onClick={props.onClick}
        >
          <CardHeader
            sx={{ padding: '0px' }}
            classes={{
              avatar: 'mr-[1.25rem]',
              title: 'text-[0.875rem] font-normal mb-[0.625rem] leading-[1.106rem] text-black pb-2',
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
            title={formatDate(props.notiInfo.date, 'hh:mm A')}
            subheader={props.content}
            action={
              <ClickAwayListener onClickAway={handleClose}>
                <IconButton
                  aria-label="settings"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    e.isPropagationStopped()
                    handleClose(e as any)
                    handleToggle()
                  }}
                  aria-haspopup="menu"
                  ref={anchorRef}
                >
                  <MoreHorizOutlined />
                </IconButton>
              </ClickAwayListener>
            }
          />
        </Card>
      </Link>

      <Popover
        open={open}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleClose}
        anchorEl={anchorRef.current}
        PaperProps={{
          sx: {
            borderRadius: 1,
            overflow: 'hidden',
          },
        }}
      >
        <MenuList>
          {props.isRead ? null : <MenuItem onClick={markHaveRead}>Đánh dấu đã đọc</MenuItem>}
          <MenuItem onClick={removeNoti}>Xóa thông báo</MenuItem>
        </MenuList>
      </Popover>
    </>
  )
}
