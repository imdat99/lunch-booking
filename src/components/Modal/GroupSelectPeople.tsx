import { IEventDetail, UserGroup } from '@app/server/firebaseType'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import InboxIcon from '@mui/icons-material/MoveToInbox'
import StarBorder from '@mui/icons-material/StarBorder'
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import { useState } from 'react'

type PropsType = {
  handleOnClose: () => void
  selectingMembers: IEventDetail[]
  handleClickRow: (user: IEventDetail) => void
  dellMember: (uid: string) => void
  userGroupList: UserGroup[] | undefined
}
function GroupSelectPeople({ selectingMembers, handleClickRow, dellMember, userGroupList }: PropsType) {
  const [open, setOpen] = useState(true)
  console.log('userGroupList', userGroupList)

  const handleClick = () => {
    setOpen(!open)
  }
  return (
    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }} component="nav" aria-labelledby="nested-list-subheader">
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <InboxIcon />
        </ListItemIcon>
        <ListItemText primary="Inbox" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItemButton sx={{ pl: 4 }}>
            <ListItemIcon>
              <StarBorder />
            </ListItemIcon>
            <ListItemText primary="Starred" />
          </ListItemButton>
        </List>
      </Collapse>
    </List>
  )
}

export default GroupSelectPeople
