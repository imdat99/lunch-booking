import { getListUser } from '@app/libs/api/EventApi'
import { getGroupById } from '@app/libs/api/userAPI'
import { IEventDetail, User, UserGroup } from '@app/server/firebaseType'
import { useAppSelector } from '@app/stores/hook'
import { userStore } from '@app/stores/user'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import _ from 'lodash'
import { useEffect, useState } from 'react'

import NomarlSelectPeople from './NomarlSelectPeople'

type PropsType = {
  open: boolean
  setOpen: any
  handleSelectedMember: any
  useSelectPeopleInGroup?: boolean
  groupId: string
  setLoading: any
  handleDelete: any
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
function GroupModal({ open, setOpen, handleSelectedMember, groupId, handleDelete }: PropsType) {
  const loginUser = useAppSelector(userStore)
  const [allMembers, setAllMembers] = useState<User[]>([])
  const [membersFilter, setMembersFilter] = useState<User[]>([])
  const [groupInfo, setGroupInfo] = useState<UserGroup>({ members: [], createUser: loginUser.uid || '', groupName: '', groupId: '' })
  const [selectingMembers, setSelectingMembers] = useState<User[]>([])
  const [filterText, setFilterText] = useState<string>('')
  const handleClickRow = (user: User) => {
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
    selectingMembers.forEach((item: User) => selectedMemberArr.push(item.uid!))
    groupInfo.members = selectedMemberArr
    handleSelectedMember(groupInfo)
    setOpen({ isOpen: false, groupId: '' })
  }
  const handleChangeGroupName = (e: any) => {
    const tempGroupInfo = _.cloneDeep(groupInfo)
    tempGroupInfo.groupName = e.target.value
    setGroupInfo(tempGroupInfo)
  }
  const removeDuplicateMembers = (allMembersInGroup: User[]) => {
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
      setMembersFilter(uniqueListMembers)
    })
  }, [groupId])

  useEffect(() => {
    setSelectingMembers([loginUser])
    setGroupInfo({ members: [], createUser: loginUser.uid || '', groupName: '', groupId: '' })
  }, [loginUser, loginUser.uid, open])

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
  const handleFilter = (value: string) => {
    const tempAllMember = _.cloneDeep(allMembers)
    const listMemberFilter = value ? tempAllMember.filter((item) => item.name?.toLocaleLowerCase().includes(value.toLowerCase())) : tempAllMember
    setMembersFilter(listMemberFilter)
  }
  const handleSearch = (value: string) => {
    handleFilter(value)
    setFilterText(value)
  }
  return (
    <Modal open={open} onClose={handleOnClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <button className="absolute top-[10px] right-[10px]" onClick={handleOnClose}>
          <CloseIcon />
        </button>
        <Box className="flex justify-center mb-3">
          <Typography variant="h5">Chi tiết group</Typography>
        </Box>
        <Typography variant="subtitle1">Tên group</Typography>
        <TextField value={groupInfo?.groupName} sx={{ marginBottom: '15px', width: '100%' }} onChange={handleChangeGroupName} />
        <Box className="flex mb-2">
          <Typography variant="subtitle1" sx={{ marginRight: '10px' }}>
            Thành viên
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'green' }}>
            {selectingMembers.length}
          </Typography>
        </Box>
        <Typography variant="subtitle1">Tìm kiếm</Typography>
        <Box className="flex justify-between mb-5">
          <TextField value={filterText} onChange={(e) => handleSearch(e.target.value)} />
          <Button variant="contained" onClick={() => handleSearch('')}>
            Clear
          </Button>
        </Box>
        <NomarlSelectPeople selectingMembers={selectingMembers} handleClickRow={handleClickRow} dellMember={dellMember} allMembers={membersFilter} />
        <Box className="flex justify-center">
          <Button onClick={handleAdd} variant="contained" sx={{ margin: '20px 15px 0px 0px' }}>
            OK
          </Button>
          <Button color="error" onClick={() => handleDelete(groupInfo.groupId)} variant="contained" sx={{ marginTop: '20px' }}>
            delete
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

export default GroupModal
