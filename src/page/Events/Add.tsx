// import { ReactComponent as DishImg } from '@app/assets/react.svg'
import './style.css'

import TextNumberInput from '@app/components/Input/NumericInput'
import PeopleModal from '@app/components/Modal/PeopleModal'
import { deleteEventDetail, setEvent, setEventDetail, updateEvent, updatePayCount, uploadEventImg } from '@app/libs/api/EventApi'
import { getUserGroupsByUserId } from '@app/libs/api/userAPI'
import { IEvent, IEventDetail, UserGroup } from '@app/server/firebaseType'
import { useAppSelector } from '@app/stores/hook'
import { listEventStore } from '@app/stores/listEvent'
import { listEventDetailStore } from '@app/stores/listEventDetail'
import { userStore } from '@app/stores/user'
import TextareaAutosize from '@mui/base/TextareaAutosize'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import PhotoCamera from '@mui/icons-material/PhotoCamera'
import ReplyIcon from '@mui/icons-material/Reply'
import { Box, CardContent, FormControl, FormControlLabel, InputAdornment, Modal, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import { styled } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import { Container } from '@mui/system'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import _, { round } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

const TextFieldStyled = styled(TextField)(({ theme }) => ({
  '& .MuiFormLabel-root': {
    ...theme.typography.subtitle1,
  },
}))

const ButtonStyled = styled(Button)(() => ({
  '&.MuiButton-root': {
    borderRadius: '10px',
  },
}))

const CardStyled = styled(Card)(() => ({
  marginTop: '30px',
  marginBottom: '15px',
  '&.MuiPaper-root': {
    borderRadius: '15px',
  },
}))

const initEventValue = {
  address: '',
  date: dayjs(new Date()).format('MM/DD/YYYY'),
  eventName: '',
  totalAmount: 0,
  userId: '',
  tip: 0,
  billAmount: 0,
  userPayId: '',
  userPayName: '',
  groupId: '',
  groupName: '',
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
  maxHeight: '100vh',
}
export const enum bonusTypeEnum {
  PERCENT = 'PERCENT',
  MONEY = 'MONEY',
}

export interface IDropdownMembers {
  label: string | null | undefined | ''
  value: string | null | undefined | ''
  isCreator: boolean | null | undefined | ''
}

const sortListByPaidCount = (members: IEventDetail[]) => {
  return members.sort((a, b) => (a.count || 0) - (b.count || 0))
}

function Add() {
  const loginUser = useAppSelector(userStore)
  const params = useParams()
  const listEventDetail = useAppSelector(listEventDetailStore)
  const listEvent = useAppSelector(listEventStore)
  const userInEvent = useMemo(() => listEventDetail.filter((event: IEventDetail) => event.eventId === params.id), [listEventDetail, params])
  const eventInfo = useMemo(() => listEvent.find((item) => item.id === params.id), [listEvent, params.id])
  const [open, setOpen] = useState(false)
  const [eventState, setEventState] = useState<IEvent>(params.id && eventInfo ? eventInfo : initEventValue)
  const [openModalSuccess, setOpenModalSuccess] = useState<boolean>(false)
  const [listBillOwner, setListBillOwner] = useState<IEventDetail[]>(userInEvent ? sortListByPaidCount([...userInEvent]) : [])
  const [selectedListMember, setSelectedListMember] = useState<IEventDetail[]>([...userInEvent])
  const [memberToPayState, setMemberToPayState] = useState<IEventDetail>()
  const [userGroupSelectBox, setUserGroupSelectBox] = useState<IDropdownMembers[]>()
  const [userGroupData, setUserGroupData] = useState<UserGroup[]>()
  const [selectedGroup, setSelectedGroup] = useState<UserGroup>()
  const [bonusType, setBonusType] = useState<bonusTypeEnum>(eventInfo?.bonusType || bonusTypeEnum.PERCENT)
  const [dropdownMembers, setDropdownMembers] = useState<IDropdownMembers[]>(
    userInEvent ? userInEvent.map((item) => ({ label: item.name || item.email, value: item.uid, isCreator: null })) : []
  )
  const [imgAvatarPreview, setImgAvatarPreview] = useState(eventInfo?.photoURL)
  const [imgAvatarObj, setImgAvatarObj] = useState<any>(null)
  const [forceRerender, setForceRerender] = useState(Date.now())
  const [openingMemberRows, setOpeningMemberRows] = useState<string[]>([])
  const [modalConfirmGroupData, setModalConfirmGroupData] = useState<any>({ isOpen: false, groupId: '', groupName: '' })

  const isEdit = useMemo(() => !!params.id && !!eventInfo, [eventInfo, params.id])
  const isEmptyMembers = useMemo(() => !selectedListMember.length, [selectedListMember])

  const handleToggle = (memberId: string) => {
    const tempMembers = _.cloneDeep(selectedListMember)
    const index = tempMembers.findIndex((u) => u.uid === memberId)
    if (index > -1) {
      const isPaid = tempMembers[index].isPaid
      tempMembers[index].isPaid = !isPaid
    }
    setSelectedListMember(tempMembers)
  }

  const handleChangeAmount = (memberId: string | null | undefined, value: number) => {
    const tempMembers = _.cloneDeep(selectedListMember)
    const tempEvenState = _.cloneDeep(eventState)
    const index = tempMembers.findIndex((u) => u.uid === memberId)
    // const bonus = calBonus(eventState.tip || 0)
    if (index > -1) {
      tempMembers[index].amount = value
      // tempMembers[index].amountToPay = value + bonus / tempMembers.length
    }
    const newTotalAmount = tempMembers.reduce((acc: number, item: IEventDetail) => acc + (item.amount || 0), 0)
    const bonus = calBonus(newTotalAmount, eventState.tip || 0, bonusType)
    const tempMembersAfterCaculate = recalculateMoneyToPay(tempMembers, bonus)
    setSelectedListMember(tempMembersAfterCaculate)
    setEventState({ ...tempEvenState, billAmount: newTotalAmount })
  }

  const handleSelectedMember = (listSelectingMembers: IEventDetail[]) => {
    const listSortedMember = sortListByPaidCount([...listSelectingMembers])
    const tempMemberToPay = listSortedMember.find((item) => item.uid === loginUser?.uid)
    setListBillOwner(listSortedMember)
    setSelectedListMember(listSelectingMembers)
    setDropdownMembers(listSelectingMembers.map((item) => ({ label: item.name || item.email, value: item.uid, isCreator: null })))
    if (tempMemberToPay && tempMemberToPay.uid) {
      setMemberToPayState(tempMemberToPay)
      setEventState({ ...eventState, userPayId: tempMemberToPay.uid, userPayName: tempMemberToPay.name ? tempMemberToPay.name : 'chưa được đặt tên' })
    }
  }

  const handleDelete = (member: IEventDetail) => {
    const newSelectedMember = [...selectedListMember]
    const index = newSelectedMember.findIndex((u) => u.uid === member.uid)
    if (index > -1) {
      newSelectedMember.splice(index, 1)
    }
    setSelectedListMember(newSelectedMember)
    if (member.uid === eventState.userPayId) {
      setEventState({ ...eventState, userPayId: '', userPayName: '' })
    }
  }

  const handleChangeTextField = (field: string, value: string | number) => {
    setEventState({ ...eventState, [field]: value })
  }

  const handleChangeBill = (value: number) => {
    const total = eventState.tip ? eventState.tip + value : value
    const tempMembers = _.cloneDeep(selectedListMember)
    tempMembers.forEach((item, index, arr) => {
      arr[index].amountToPay = 0
      arr[index].amount = 0
    })
    setSelectedListMember(tempMembers)
    setEventState({ ...eventState, billAmount: value, totalAmount: total })
  }

  const calBonus = (billAmount: number, tipAmount: number, bonusType: bonusTypeEnum) => {
    let bonus = 0
    if (bonusType === bonusTypeEnum.PERCENT) {
      bonus = billAmount && tipAmount > 0 ? (billAmount * tipAmount) / 100 : 0
    } else {
      bonus = tipAmount
    }
    return Math.round(bonus)
  }

  const recalculateMoneyToPay = (arrListMember: IEventDetail[], bonus: number) => {
    arrListMember.forEach((item, index, arr) => {
      if (arr[index].amount) arr[index].amountToPay = Math.round((item.amount || 0) + bonus / arrListMember.length)
    })
    return arrListMember
  }

  const handleChangeTip = (value: number, bonusType1: bonusTypeEnum) => {
    const bonus = calBonus(eventState.billAmount || 0, value, bonusType1)
    const tempMembers = _.cloneDeep(selectedListMember)
    const tempMembersAfterCaculate = recalculateMoneyToPay(tempMembers, bonus)
    setSelectedListMember(tempMembersAfterCaculate)
    const total = eventState.billAmount ? Number(eventState.billAmount + bonus) : bonus
    setEventState({ ...eventState, tip: value, totalAmount: total })
  }

  const handleCreateEvent = async () => {
    try {
      const isAllPaid = selectedListMember.every((item: IEventDetail) => item.isPaid === true)
      const billImage = imgAvatarObj ? await uploadEventImg(imgAvatarObj) : imgAvatarPreview
      const eventData = { ...eventState, isAllPaid, bonusType, photoURL: billImage ? billImage : '' }
      for (const item of userInEvent) {
        if (item.id) {
          deleteEventDetail(item.id)
        }
      }
      if (params.id) {
        const { isSuccess, eventId } = await updateEvent(params.id, eventData)
        if (isSuccess) {
          const promises: Promise<any>[] = []
          selectedListMember.map((member) => {
            const eventDetail = { ...member, eventId, id: eventId + member.uid }
            promises.push(setEventDetail(eventDetail))
          })
          await Promise.all(promises)
          setOpenModalSuccess(true)
        }
      } else {
        const { isSuccess, eventId } = await setEvent(eventData)
        if (isSuccess) {
          const promises: Promise<any>[] = []
          selectedListMember.map((member) => {
            const eventDetail = { ...member, eventId, id: eventId + member.uid }
            setEventDetail(eventDetail)
          })
          await Promise.all(promises)
          setOpenModalSuccess(true)
        }
      }

      if (memberToPayState?.uid) {
        const payCount = (memberToPayState?.count || 0) + 1
        updatePayCount(memberToPayState.uid, payCount)
      }
    } catch (e) {
      console.log('ERROR UPDATING BILL: ', e)
    }
  }
  console.log('selectedListMember', selectedListMember)

  const handleShareBill = () => {
    const selectedListMembersWithMoney = _.cloneDeep(selectedListMember)
    const numberOfMember = selectedListMembersWithMoney.length
    if (numberOfMember > 0) {
      const amount = Math.round((eventState.billAmount || 0) / numberOfMember)
      const amountToPay = Math.round((eventState.totalAmount || 0) / numberOfMember)
      selectedListMembersWithMoney.forEach((item: IEventDetail, index: number, arr: IEventDetail[]) => {
        arr[index].amount = amount
        arr[index].amountToPay = amountToPay
      })
    }
    setSelectedListMember(selectedListMembersWithMoney)
  }

  const handleAutoPickBillOwner = () => {
    const billOwner = listBillOwner.pop()

    if (!listBillOwner.length) {
      const resetListBillOwner = sortListByPaidCount([...selectedListMember])
      setListBillOwner(resetListBillOwner)
    }

    if (billOwner && billOwner.uid && billOwner.email) {
      setMemberToPayState(billOwner)
      setEventState({ ...eventState, userPayId: billOwner.uid, userPayName: billOwner.name ? billOwner.name : billOwner.email })
    }
    setForceRerender(Date.now())
  }

  const handleCloseModalSuccess = () => {
    setOpenModalSuccess(false)
  }

  const handleChangeBonusType = (type: bonusTypeEnum) => {
    setBonusType(type)
    handleChangeTip(Number(eventState.tip), type)
  }

  const onChangeBillOwner = (_event: any, selectedUser: any) => {
    if (!selectedUser) {
      setEventState({ ...eventState, userPayName: '', userPayId: '' })
      return
    }
    setEventState({ ...eventState, userPayId: selectedUser.value, userPayName: selectedUser.label })
  }
  const onChangeGroup = (_event: any, selectedGroupOption: any) => {
    if (!selectedGroupOption) {
      setEventState({ ...eventState, groupId: '', groupName: '' })
      return
    }
    const tempSelectedGroup = userGroupData?.find((item: UserGroup) => item.groupId === selectedGroupOption.value)
    if (tempSelectedGroup) {
      setSelectedGroup(tempSelectedGroup)
    }
    if (selectedGroup?.members) {
      setModalConfirmGroupData({ isOpen: true, groupId: selectedGroupOption.value, groupName: selectedGroupOption.label })
      return
    }
    setEventState({ ...eventState, groupId: selectedGroupOption.value, groupName: selectedGroupOption.label })
  }
  const handleConfirmGroupChange = () => {
    setEventState({ ...eventState, groupId: modalConfirmGroupData.groupId, groupName: modalConfirmGroupData.groupName })
    setSelectedListMember([])
    setModalConfirmGroupData({ isOpen: false, groupId: '', groupName: '' })
  }
  const handlePreviewAvatarChange = (event: any) => {
    const fileUploaded = event.target ? event.target.files[0] : null
    if (fileUploaded) {
      setImgAvatarObj(fileUploaded)
      setImgAvatarPreview(URL.createObjectURL(fileUploaded))
    }
  }

  const handleCancelChangeGroup = () => {
    setModalConfirmGroupData({ isOpen: false, groupId: '', groupName: '' })
  }
  useEffect(() => {
    const bonus = calBonus(eventState.billAmount || 0, eventState.tip || 0, bonusType)
    const total = (eventState.billAmount || 0) + bonus
    setEventState({ ...eventState, totalAmount: total })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventState.billAmount])

  useEffect(() => {
    return () => {
      if (imgAvatarPreview) {
        URL.revokeObjectURL(imgAvatarPreview)
      }
    }
  }, [imgAvatarPreview])

  useEffect(() => {
    getUserGroupsByUserId(loginUser?.uid || '').then((group: UserGroup[] | undefined) => {
      // eslint-disable-next-line max-len
      const groupSelectBox = group?.map((item) => ({ label: item.groupName, value: item.groupId, isCreator: item.createUser == loginUser.uid ? true : false }))
      setUserGroupSelectBox(groupSelectBox)
      setUserGroupData(group)
      if (eventState.groupId) {
        const selectedGroup = group?.find((group) => group.groupId === eventState.groupId)
        setSelectedGroup(selectedGroup)
      }
    })
  }, [])

  const handleOpenMemberDetail = (memberUid: string) => {
    let newOpeningMemberRows = [...openingMemberRows]
    if (openingMemberRows.includes(memberUid)) {
      newOpeningMemberRows = openingMemberRows.filter((item) => item !== memberUid)
    } else {
      newOpeningMemberRows.push(memberUid)
    }
    setOpeningMemberRows(newOpeningMemberRows)
  }

  return (
    <div className="bg-white">
      <div className="bg-gradient-to-t from-green-300 to-light-color rounded-b-3xl">
        <Container>
          <div className="block p-2">
            <Tooltip title="Back to event list">
              <button className="float-left">
                <div>
                  <ReplyIcon
                    onClick={() => {
                      history.back()
                    }}
                    fontSize={'large'}
                  />
                </div>
              </button>
            </Tooltip>
            <div className="justify-center text-center font-[Bellota] text-[24px] pb-3">
              <span>{isEdit ? 'Sửa hoá đơn' : 'Tạo mới hoá đơn'}</span>
            </div>
          </div>
        </Container>
      </div>
      <Container maxWidth="md">
        <div>
          <Box className="mt-6">
            <TextFieldStyled
              fullWidth
              label="Tên"
              value={eventState?.eventName}
              onChange={(e) => handleChangeTextField('eventName', e.target.value)}
              variant="standard"
              InputLabelProps={{
                shrink: true,
              }}
              error={!eventState.eventName}
            />
          </Box>
          <Box className="mt-6">
            <DatePicker
              className="w-full "
              label="Thời gian"
              value={dayjs(eventState.date).format('MM/DD/YYYY')}
              inputFormat="DD/MM/YYYY"
              onChange={(newValue) => {
                handleChangeTextField('date', dayjs(newValue).format('MM/DD/YYYY'))
              }}
              renderInput={(params) => (
                <TextFieldStyled
                  variant="standard"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  {...params}
                />
              )}
            />
          </Box>
          <Box className="mt-5">
            <Typography variant="subtitle2" sx={{ color: isEmptyMembers ? '#E1251B' : '' }}>
              Group
            </Typography>
            <Autocomplete
              value={{ value: eventState?.groupId, label: eventState.groupName, isCreator: null }}
              options={userGroupSelectBox || []}
              onChange={onChangeGroup}
              renderInput={(params) => <TextField name="billOwnerValue" {...params} variant="standard" />}
            />
          </Box>
          <Box className="flex items-center mt-3">
            <Typography variant="subtitle2" sx={{ color: isEmptyMembers ? '#E1251B' : '' }}>
              Thành viên
            </Typography>
            <span style={{ color: isEmptyMembers ? '#E1251B' : '' }}> &nbsp; {selectedListMember?.length || 0}</span>
            {eventState?.groupId && (
              <ButtonStyled>
                <AddIcon
                  color="success"
                  onClick={() => {
                    setOpen(true)
                  }}
                />
              </ButtonStyled>
            )}
          </Box>

          {/* Members table */}
          {!isEmptyMembers && (
            <>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ border: 'none' }}>
                      <TableCell style={{ minWidth: '20px' }}></TableCell>
                      <TableCell style={{ minWidth: '85px' }}>
                        <Typography variant="subtitle1">Đã trả</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1">Tên</Typography>
                      </TableCell>
                      <TableCell style={{ minWidth: '130px' }}>
                        <Typography variant="subtitle1">Bill</Typography>
                      </TableCell>
                      <TableCell style={{ minWidth: '130px' }}>
                        <Typography variant="subtitle1">Thành Tiền</Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedListMember.map((member, index) => {
                      const labelId = `checkbox-list-label-${member.uid}`
                      return (
                        <>
                          <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                            <TableCell style={{ border: 'none' }}>
                              <IconButton
                                aria-label="expand row"
                                size="small"
                                onClick={() => {
                                  handleOpenMemberDetail(member?.uid || '')
                                }}
                              >
                                {openingMemberRows.includes(member?.uid || '') ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                              </IconButton>
                            </TableCell>

                            <TableCell style={{ border: 'none', padding: '5px 16px', textAlign: 'center' }}>
                              <Checkbox
                                onClick={() => (member.uid ? handleToggle(member.uid) : undefined)}
                                key={forceRerender}
                                className="w-[20px]"
                                edge="start"
                                checked={member.isPaid}
                                tabIndex={-1}
                                disableRipple
                                inputProps={{ 'aria-labelledby': labelId }}
                              />
                            </TableCell>
                            <TableCell style={{ border: 'none', padding: '5px 16px' }}>
                              <Typography noWrap>
                                <Tooltip title={member.name || member.email}>
                                  <span> {member.name || member.email} </span>
                                </Tooltip>
                              </Typography>
                            </TableCell>
                            <TableCell style={{ border: 'none', padding: '5px 16px' }}>
                              <TextNumberInput
                                thousandSeparator=","
                                fullWidth
                                id="filled-required"
                                variant="standard"
                                value={member.amount}
                                onValueChange={(values) => handleChangeAmount(member.uid, round(_.toNumber(values.value), 3))}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                defaultValue={0}
                              />
                            </TableCell>
                            <TableCell style={{ border: 'none', padding: '5px 16px' }}>
                              <TextNumberInput
                                thousandSeparator=","
                                fullWidth
                                id="filled-required"
                                variant="standard"
                                value={member.amountToPay}
                                disabled
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                defaultValue={0}
                              />
                            </TableCell>

                            <TableCell style={{ border: 'none', padding: '5px 16px' }}>
                              <ButtonStyled onClick={() => handleDelete(member)}>
                                <DeleteIcon color="error" />
                              </ButtonStyled>
                            </TableCell>
                          </TableRow>

                          <TableRow key={`more-infor-${member.uid}`}>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                              <Collapse in={openingMemberRows.includes(member?.uid || '')} timeout="auto" unmountOnExit>
                                <p className="italic text-[#9c9c9c]">{member.note ? `"${member.note}"` : 'No note'}</p>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          <Typography variant="subtitle2" sx={{ marginTop: '20px' }}>
            Người trả bill
          </Typography>
          <Box sx={{ flexGrow: 1 }} className="mt-2">
            <Grid container spacing={2}>
              <Grid item md={4} xs={5} style={{ display: 'flex', alignItems: 'center' }}>
                <ButtonStyled sx={{ padding: '10px' }} variant="contained" onClick={handleAutoPickBillOwner} disabled={!selectedListMember.length}>
                  <Typography>Auto Pick</Typography>
                </ButtonStyled>
              </Grid>
              <Grid item md={8} xs={7}>
                <Autocomplete
                  disabled={!selectedListMember.length}
                  value={{ value: eventState?.userPayName, label: eventState.userPayName, isCreator: null }}
                  options={dropdownMembers}
                  onChange={onChangeBillOwner}
                  renderInput={(params) => <TextField name="billOwnerValue" {...params} variant="standard" />}
                />
              </Grid>
            </Grid>
          </Box>
          <Box className="w-full flex mt-3 items-center gap-2">
            <TextNumberInput
              thousandSeparator=","
              allowLeadingZeros={false}
              fullWidth
              variant="standard"
              label="Tổng hóa đơn"
              placeholder="1K = 1000 VND"
              value={eventState?.billAmount}
              onValueChange={(values) => {
                handleChangeBill(round(_.toNumber(values.value), 3))
              }}
              InputProps={{
                endAdornment: bonusType === bonusTypeEnum.PERCENT ? <InputAdornment position="end">K VND</InputAdornment> : null,
                sx: {
                  '& input': {
                    textAlign: 'right',
                  },
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue={0}
              error={!eventState.billAmount}
            />
            <ButtonStyled variant="contained" className="text-[14px] w-[140px]" sx={{ marginTop: '16px' }} onClick={handleShareBill}>
              Chia đều
            </ButtonStyled>
          </Box>
          <Typography variant="subtitle2" sx={{ marginTop: '10px' }}>
            Note
          </Typography>
          <TextareaAutosize
            className="bill-note-textarea"
            name="billNote"
            value={eventState.note}
            style={{ width: '100%', fontFamily: 'Bellota', borderBottom: '1px solid #9c9c9c' }}
            onChange={(e) =>
              setEventState((prev) => {
                return { ...prev, note: e.target.value }
              })
            }
            maxRows={5}
            minRows={2}
          />

          <Box className="mt-5 flex items-center justify-between">
            <FormControl>
              <Typography variant="subtitle2">Hoa hồng</Typography>
              <RadioGroup
                row
                aria-labelledby="demo-form-control-label-placement"
                name="position"
                defaultValue="top"
                onChange={(e) => {
                  handleChangeBonusType(e.target.value as bonusTypeEnum)
                }}
              >
                <FormControlLabel value={bonusTypeEnum.MONEY} checked={bonusType === bonusTypeEnum.MONEY} control={<Radio />} label="Nhập số" />
                <FormControlLabel value={bonusTypeEnum.PERCENT} checked={bonusType === bonusTypeEnum.PERCENT} control={<Radio />} label="Phần trăm" />
              </RadioGroup>
            </FormControl>
            <TextNumberInput
              thousandSeparator=","
              value={eventState?.tip}
              onValueChange={(values) => {
                handleChangeTip(_.toNumber(values.value), bonusType)
              }}
              InputProps={{
                endAdornment:
                  bonusType === bonusTypeEnum.PERCENT ? (
                    <InputAdornment position="end">%</InputAdornment>
                  ) : (
                    <InputAdornment position="end">K VND</InputAdornment>
                  ),
                sx: {
                  '& input': {
                    textAlign: 'right',
                  },
                },
              }}
              variant="standard"
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue={0}
            />
          </Box>
          <Box className="mt-5">
            <TextNumberInput
              thousandSeparator=","
              fullWidth
              id="filled-required"
              label="Tổng tiền"
              value={eventState?.totalAmount}
              variant="standard"
              disabled
              InputProps={{
                endAdornment: bonusType === bonusTypeEnum.PERCENT ? <InputAdornment position="end">K VND</InputAdornment> : null,
                sx: {
                  '& input': {
                    textAlign: 'right',
                  },
                },
              }}
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue={0}
            />
          </Box>
          <Box className="flex flex-col mt-[10px]">
            <span className="text-center">
              {imgAvatarPreview ? (
                <img alt="bill_image" src={imgAvatarPreview} className="max-w-[60%] max-h-[60%]  m-auto" />
              ) : (
                <span className="italic">Không có ảnh hoá đơn</span>
              )}
            </span>

            <Tooltip title="Upload ảnh hoá đơn">
              <Button onChange={handlePreviewAvatarChange} component="label">
                <PhotoCamera fontSize={'large'} />
                <input hidden accept="image/*" type="file" />
              </Button>
            </Tooltip>
          </Box>
          {/* Submit button */}
          <Box className="flex justify-center py-7">
            <ButtonStyled variant="contained" onClick={handleCreateEvent} disabled={!eventState.eventName || isEmptyMembers || !eventState.billAmount}>
              <Typography>{params.id ? 'Cập nhật' : 'Tạo hóa đơn'}</Typography>
            </ButtonStyled>
          </Box>
          {eventState?.groupId && (
            <PeopleModal
              open={open}
              setOpen={setOpen}
              handleSelectedMember={handleSelectedMember}
              selectedListMember={selectedListMember}
              selectedGroup={selectedGroup}
              useSelectPeopleInGroup={true}
            />
          )}
          <Modal
            open={modalConfirmGroupData.isOpen}
            onClose={handleCancelChangeGroup}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <button className="absolute top-[10px] right-[10px]" onClick={handleCancelChangeGroup}>
                <CloseIcon />
              </button>
              <Typography variant="h5">Khi chuyển group sẽ xóa thông tin thành viên bạn đã chọn. Bạn đã chắc chưa?</Typography>
              <Box className="flex mt-5 justify-center">
                <Button onClick={handleConfirmGroupChange} variant="contained" sx={{ marginRight: '15px' }}>
                  Chắc
                </Button>
                <Button onClick={handleCancelChangeGroup} variant="contained">
                  Bỏ đi
                </Button>
              </Box>
            </Box>
          </Modal>
          <Snackbar
            open={!!openModalSuccess}
            autoHideDuration={1500}
            onClose={handleCloseModalSuccess}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseModalSuccess} severity="success" sx={{ width: '100%', backgroundColor: '#baf7c2' }}>
              <span className="font-bold"> {isEdit ? 'Cập nhật hoá đơn thành công!' : 'Tạo hoá đơn thành công!'} </span>
            </Alert>
          </Snackbar>
        </div>
      </Container>
    </div>
  )
}

export default Add
