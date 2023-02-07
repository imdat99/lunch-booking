import { getListUser } from '@app/libs/api/EventApi'
import { getGroupById } from '@app/libs/api/userAPI'
import { IEventDetail, UserGroup } from '@app/server/firebaseType'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import _ from 'lodash'
import { useEffect, useState } from 'react'

import NomarlSelectPeople from './NomarlSelectPeople'
import { useAppSelector } from '@app/stores/hook'
import { userStore } from '@app/stores/user'

type PropsType = {
  open: boolean
  setOpen: any
  handleSelectedMember: any
  useSelectPeopleInGroup?: boolean
  groupId: string
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
function GroupModal({ open, setOpen, handleSelectedMember, groupId }: PropsType) {
  const loginUser = useAppSelector(userStore)
  const [allMembers, setAllMembers] = useState<IEventDetail[]>([])
  const [groupInfo, setGroupInfo] = useState<UserGroup>({ members: [], createUser: loginUser.uid || '', groupName: '', groupId: '' })
  const [selectingMembers, setSelectingMembers] = useState<IEventDetail[]>([])
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
    const selectedMemberArr: string[] = []
    selectingMembers.forEach((item: IEventDetail) => selectedMemberArr.push(item.uid!))
    groupInfo.members = selectedMemberArr
    handleSelectedMember(groupInfo)
    setOpen({ isOpen: false, groupId: '' })
  }
  const handleChangeGroupName = (e: any) => {
    const tempGroupInfo = _.cloneDeep(groupInfo)
    tempGroupInfo.groupName = e.target.value
    setGroupInfo(tempGroupInfo)
  }
  const removeDuplicateMembers = (allMembersInGroup: IEventDetail[]) => {
    const uniqueListMembers = allMembersInGroup.filter((item, index, list) => index === list.findIndex((member) => member.uid === item.uid))
    return uniqueListMembers
  }
  useEffect(() => {
    getListUser().then((allMembers) => {
      const uniqueListMembers = removeDuplicateMembers(allMembers)
      if (groupId) {
        getGroupById(groupId).then((group) => {
          const membersInGroup = group?.members
          const members = uniqueListMembers.filter((member) => membersInGroup?.includes(member?.uid as string))
          setSelectingMembers(members)
          setGroupInfo(group!)
        })
      }
      setAllMembers(uniqueListMembers)
    })
  }, [groupId])

  useEffect(() => {
    setSelectingMembers([])
    setGroupInfo({ members: [], createUser: loginUser.uid || '', groupName: '', groupId: '' })
  }, [loginUser.uid, open])

  const handleOnClose = () => {
    setOpen({ isOpen: false, groupId: '' })
    setSelectingMembers([])
  }
  const dellMember = (uid: string) => {
    const tempMember = _.cloneDeep(allMembers)
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
        <Box className="flex justify-center">
          <Typography variant="h5">Chi tiết group</Typography>
        </Box>
        <Typography variant="subtitle1">Tên group</Typography>
        <TextField value={groupInfo?.groupName} className="w-full" onChange={handleChangeGroupName} />
        <Typography variant="subtitle1">Member</Typography>
        <NomarlSelectPeople selectingMembers={selectingMembers} handleClickRow={handleClickRow} dellMember={dellMember} allMembers={allMembers} />
        <Button onClick={handleAdd} variant="contained" sx={{ marginTop: '20px' }}>
          OK
        </Button>
      </Box>
    </Modal>
  )
}

export default GroupModal
