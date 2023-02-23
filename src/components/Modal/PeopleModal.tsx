import { getListUser } from '@app/libs/api/EventApi'
import { IEventDetail, UserGroup } from '@app/server/firebaseType'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import _ from 'lodash'
import { useEffect, useState } from 'react'

import NomarlSelectPeople from './NomarlSelectPeople'

type PropsType = {
  open: boolean
  setOpen: any
  handleSelectedMember: any
  selectedListMember: IEventDetail[]
  selectedGroup?: UserGroup
  useSelectPeopleInGroup?: boolean
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
  overflowY: 'scroll',
  height: '100%',
  maxHeight: '100vh',
  p: '0 2rem',
}

function PeopleModal({ open, setOpen, handleSelectedMember, selectedListMember, selectedGroup, useSelectPeopleInGroup = false }: PropsType) {
  const [allMembers, setAllMembers] = useState<IEventDetail[]>([])
  const [membersFilter, setMembersFilter] = useState<IEventDetail[]>([])
  const [allMembersInGroup, setAllMembersInGroup] = useState<IEventDetail[]>([])
  const [newMemberName, setNewMemberName] = useState<string>()
  const [selectingMembers, setSelectingMembers] = useState<IEventDetail[]>([...selectedListMember])
  const [filterText, setFilterText] = useState<string>('')

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
  const initialMemberInGroup = () => {
    const tempMembers: IEventDetail[] = []
    selectedGroup?.members.forEach((uid: string) => {
      const member = allMembers.find((member: IEventDetail) => member.uid === uid)
      if (member) {
        tempMembers.push(member)
      }
    })
    const allMemberAndOthers = [...tempMembers]
    setAllMembersInGroup(allMemberAndOthers)
    setMembersFilter(allMemberAndOthers)
  }
  useEffect(() => {
    getListUser().then((allMembers) => {
      const allMemberAndOthers = [...allMembers, ...selectingMembers]
      setAllMembers(allMemberAndOthers)
    })
  }, [])

  useEffect(() => {
    if (useSelectPeopleInGroup) {
      initialMemberInGroup()
    } else {
      setAllMembersInGroup(allMembers)
      setMembersFilter(allMembers)
    }
  }, [allMembers, selectedGroup, useSelectPeopleInGroup])

  useEffect(() => {
    setSelectingMembers([...selectedListMember])
    initialMemberInGroup()
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
  const handleFilter = (value: string) => {
    const tempAllMember = _.cloneDeep(allMembersInGroup)
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
        <Box className="sticky top-0 bg-white z-10 pt-5 pb-1">
          <button className="absolute top-[10px] right-[10px]" onClick={handleOnClose}>
            <CloseIcon />
          </button>
          <Typography variant="h5">Chọn người đi ăn</Typography>
          <Typography variant="subtitle1">Tìm kiếm</Typography>
          <Box className="flex justify-between mb-5">
            <TextField value={filterText} onChange={(e) => handleSearch(e.target.value)} />
            <Button variant="contained" onClick={() => handleSearch('')}>
              Clear
            </Button>
          </Box>
        </Box>
        <NomarlSelectPeople selectingMembers={selectingMembers} handleClickRow={handleClickRow} dellMember={dellMember} allMembers={membersFilter} />
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
