import { getListUser } from '@app/libs/api/EventApi'
import { User } from '@app/server/firebaseType'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Button, Modal, TextField, Typography } from '@mui/material'
import _ from 'lodash'
import { useEffect, useState } from 'react'

type PropsType = {
  open: boolean
  setOpen: any
  handleSelectedMember: any
  selectedListMember: User[]
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
  maxHeight: '75%',
}
function PeopleModal({ open, setOpen, handleSelectedMember, selectedListMember }: PropsType) {
  const [allMembers, setAllMembers] = useState<User[]>([])
  const [newMemberName, setNewMemberName] = useState<string>()

  // const { selectedListMember } = useAppSelector(billStore)
  const [selectingMembers, setSelectingMembers] = useState<User[]>([...selectedListMember])
  // const dispatch = useAppDispatch()
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
    const formatSelectingMembers: User[] = []

    selectingMembers.map((member: User) =>
      formatSelectingMembers.push({
        uid: member.uid,
        name: member.name,
        email: member.email,
      })
    )
    handleSelectedMember(formatSelectingMembers)
    // dispatch(setSelectedListMember(formatSelectingMembers))
    // setSelectingMembers([])
    setOpen(false)
  }

  const removeDuplicateMembers = (allMembers: User[]) => {
    const uniqueListMembers = allMembers.filter((item, index, list) => index === list.findIndex((member) => member.uid === item.uid))
    return uniqueListMembers
  }

  useEffect(() => {
    getListUser().then((allMembers) => {
      const uniqueListMembers = removeDuplicateMembers(allMembers)
      setAllMembers(uniqueListMembers)
    })
  }, [])

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
    const tempListAllMember = _.cloneDeep(allMembers)
    const newMember = {
      name: newMemberName,
      uid: (Math.random() + 1).toString(36).substring(7),
      email: 'người ngoài chưa được set tên',
    }
    tempListSelectingMember.push(newMember)
    tempListAllMember.push(newMember)
    setSelectingMembers(tempListSelectingMember)
    setAllMembers(tempListAllMember)
    setNewMemberName('')
  }
  return (
    <Modal open={open} onClose={handleOnClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <button className="absolute top-[10px] right-[10px]" onClick={handleOnClose}>
          <CloseIcon />
        </button>
        <Typography variant="h5">Chọn người đi ăn</Typography>
        {allMembers?.map((item: User) => (
          <Box
            key={item.uid}
            className={`hover:cursor-pointer ${selectingMembers.find((user) => item.uid === user.uid) ? 'bg-green-300' : ''} p-3 rounded-md mb-2`}
            onClick={() => handleClickRow(item)}
          >
            <Typography>{item.name || item.email || 'no name'}</Typography>
          </Box>
        ))}
        <Typography variant="h5" sx={{ marginBottom: '10px' }}>
          Thêm người ngoài
        </Typography>
        <Box className="flex">
          <TextField value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full" />
          <Button onClick={handleAddNewMember}>
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
