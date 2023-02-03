import { getListUser } from '@app/libs/api/EventApi'
import { IEventDetail, User, UserGroup } from '@app/server/firebaseType'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import { height } from '@mui/system'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import NomarlSelectPeople from './NomarlSelectPeople'
import GroupSelectPeople from './GroupSelectPeople'
import { getUserGroup } from '@app/libs/api/userAPI'

type PropsType = {
  open: boolean
  setOpen: any
  handleSelectedMember: any
  selectedListMember: IEventDetail[]
  selectedGroup: UserGroup
}
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'scroll',
  maxHeight: '100vh',
}
function PeopleModal({ open, setOpen, handleSelectedMember, selectedListMember, selectedGroup }: PropsType) {
  const [allMembers, setAllMembers] = useState<IEventDetail[]>([])
  const [allMembersInGroup, setAllMembersInGroup] = useState<IEventDetail[]>([])
  const [newMemberName, setNewMemberName] = useState<string>()
  const [selectingMembers, setSelectingMembers] = useState<IEventDetail[]>([...selectedListMember])
  const handleClickRow = (user: IEventDetail) => {
    const tempMembers = [...selectingMembers]
    const index = tempMembers.findIndex((u) => u.uid === user.uid)
    if (index > -1) {
      tempMembers.splice(index, 1)
    } else {
      tempMembers.push(user)
    }
    setSelectingMembers(tempMembers)
  }
  const handleAdd = () => {
    const formatSelectingMembers: IEventDetail[] = []

    selectingMembers.map((member: IEventDetail) =>
      formatSelectingMembers.push({
        ...member,
        uid: member.uid,
        name: member.name,
        email: member.email,
      })
    )
    handleSelectedMember(formatSelectingMembers)
    setOpen(false)
  }

  const removeDuplicateMembers = (allMembersInGroup: IEventDetail[]) => {
    const uniqueListMembers = allMembersInGroup.filter((item, index, list) => index === list.findIndex((member) => member.uid === item.uid))
    return uniqueListMembers
  }

  useEffect(() => {
    getListUser().then((allMembers) => {
      const allMemberAndOthers = [...allMembers, ...selectingMembers]
      const uniqueListMembers = removeDuplicateMembers(allMemberAndOthers)
      setAllMembers(uniqueListMembers)
    })
  }, [])

  useEffect(() => {
    const tempMembers: IEventDetail[] = []
    selectedGroup.members.forEach((uid: string) => {
      const member = allMembers.find((member: IEventDetail) => member.uid === uid)
      if (member) {
        tempMembers.push(member)
      }
    })
    const allMemberAndOthers = [...tempMembers, ...selectingMembers]
    const uniqueListMembers = removeDuplicateMembers(allMemberAndOthers)
    setAllMembersInGroup(uniqueListMembers)
  }, [allMembers, selectedGroup, selectingMembers])

  useEffect(() => {
    setSelectingMembers([...selectedListMember])
    setNewMemberName('')
  }, [open])

  const handleOnClose = () => {
    setOpen(false)
    setSelectingMembers([])
  }
  const handleAddNewMember = () => {
    const tempListSelectingMember = _.cloneDeep(selectingMembers)
    const tempListAllMember = _.cloneDeep(allMembersInGroup)
    const newMember: IEventDetail = {
      name: newMemberName,
      uid: (Math.random() + 1).toString(36).substring(7),
      email: 'người ngoài chưa được set tên',
      isGuess: true,
    }
    tempListSelectingMember.push(newMember)
    tempListAllMember.push(newMember)
    setSelectingMembers(tempListSelectingMember)
    setAllMembers(tempListAllMember)
    setNewMemberName('')
  }
  const dellMember = (uid: string) => {
    const tempMember = _.cloneDeep(allMembersInGroup)
    const listMemberAfterDel = tempMember.filter((item) => item.uid !== uid)
    const filterListSelectingMember = selectingMembers.filter((item) => item.uid !== uid)
    setAllMembers(listMemberAfterDel)
    setSelectingMembers(filterListSelectingMember)
  }
  return (
    <Modal open={open} onClose={handleOnClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <button className="absolute top-[10px] right-[10px]" onClick={handleOnClose}>
          <CloseIcon />
        </button>
        <Typography variant="h5">Chọn người đi ăn</Typography>
        <NomarlSelectPeople
          handleOnClose={handleOnClose}
          selectingMembers={selectingMembers}
          handleClickRow={handleClickRow}
          dellMember={dellMember}
          allMembers={allMembersInGroup}
        />
        <Typography variant="h5" sx={{ marginBottom: '10px' }}>
          Thêm người ngoài
        </Typography>
        <Box className="flex">
          <TextField value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full" />
          <Button onClick={handleAddNewMember} disabled={!newMemberName}>
            <AddIcon />
          </Button>
        </Box>
        <Button onClick={handleAdd} variant="contained" sx={{ marginTop: '20px' }}>
          OK
        </Button>
      </Box>
    </Modal>
  )
}

export default PeopleModal
