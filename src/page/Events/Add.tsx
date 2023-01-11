// import { ReactComponent as DishImg } from '@app/assets/react.svg'
import TextNumberInput from '@app/components/Input/NumericInput'
import PeopleModal from '@app/components/Modal/PeopleModal'
import { setEvent, setEventDetail, updateEvent, updateEventDetail, updatePayCount } from '@app/libs/api/EventApi'
import { IEvent, IEventDetail, User } from '@app/server/firebaseType'
import { useAppSelector } from '@app/stores/hook'
import { listEventStore } from '@app/stores/listEvent'
import { listEventDetailStore } from '@app/stores/listEventDetail'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ReplyIcon from '@mui/icons-material/Reply'
import { Box, CardContent, FormControl, FormControlLabel, FormLabel, InputAdornment, Modal, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import { styled } from '@mui/material/styles'
import Tooltip from '@mui/material/Tooltip'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import * as dayjs from 'dayjs'
import _, { round } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

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
  '&.MuiPaper-root': {
    borderRadius: '15px',
  },
}))
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
}

const initEventValue = {
  address: '',
  date: dayjs(new Date()).format('DD/MM/YYYY'),
  eventName: '',
  totalAmount: 0,
  userId: '',
  tip: 0,
  billAmount: 0,
  userPayId: '',
  userPayName: '',
}
export const enum bonusTypeEnum {
  PERCENT = 'PERCENT',
  MONEY = 'MONEY',
}
function Add() {
  const params = useParams()
  const listEventDetail = useAppSelector(listEventDetailStore)
  const listEvent = useAppSelector(listEventStore)
  const userInEvent = useMemo(() => listEventDetail.filter((event) => event.eventId === params.id), [listEventDetail, params])
  const eventInfo = useMemo(() => listEvent.find((item) => item.id === params.id), [listEvent, params.id])
  // const { billDetail, isEditBill } = useAppSelector(billStore)
  const [eventState, setEventState] = useState<IEvent>(params.id && eventInfo ? eventInfo : initEventValue)
  const [openModalSuccess, setOpenModalSuccess] = useState<boolean>(false)
  const [listBillOwner, setListBillOwner] = useState<User[]>([])
  const [selectedListMember, setSelectedListMember] = useState<IEventDetail[]>([...userInEvent])
  const [memberToPayState, setMemberToPayState] = useState<IEventDetail>()
  const [bonusType, setBonusType] = useState<bonusTypeEnum>(bonusTypeEnum.PERCENT)
  const navigate = useNavigate()
  // const dispatch = useAppDispatch()

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
    const bonus = calBonus(newTotalAmount, eventState.tip || 0)
    const tempMembersAfterCaculate = recalculateMoneyToPay(tempMembers, bonus)
    setSelectedListMember(tempMembersAfterCaculate)
    setEventState({ ...tempEvenState, billAmount: newTotalAmount })
  }
  const handleSelectedMember = (listSelectingMembers: IEventDetail[]) => {
    setSelectedListMember(listSelectingMembers)
  }
  const [open, setOpen] = useState(false)

  const handleDelete = (member: User) => {
    const newSelectedMember = [...selectedListMember]
    const index = newSelectedMember.findIndex((u) => u.uid === member.uid)
    if (index > -1) {
      newSelectedMember.splice(index, 1)
    }
    setSelectedListMember(newSelectedMember)
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
  const calBonus = (billAmount: number, tipAmount: number) => {
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
      arr[index].amountToPay = Math.round((item.amount || 0) + bonus / arrListMember.length)
    })
    return arrListMember
  }
  const handleChangeTip = (value: number) => {
    const bonus = calBonus(eventState.billAmount || 0, value)

    const tempMembers = _.cloneDeep(selectedListMember)
    const tempMembersAfterCaculate = recalculateMoneyToPay(tempMembers, bonus)
    setSelectedListMember(tempMembersAfterCaculate)
    const total = eventState.billAmount ? Number(eventState.billAmount + bonus) : bonus
    setEventState({ ...eventState, tip: value, totalAmount: total })
  }
  const handleCreateEvent = async () => {
    const isAllPaid = selectedListMember.every((item: IEventDetail) => item.isPaid === true)
    const eventData = { ...eventState, isAllPaid }

    if (params.id) {
      const { isSuccess, eventId } = await updateEvent(params.id, eventData)
      if (isSuccess) {
        const promises: Promise<any>[] = []
        selectedListMember.map((member) => {
          const eventDetail = { ...member, eventId }
          if (member.id) promises.push(updateEventDetail(member.id, eventDetail))
        })
        await Promise.all(promises)
        setOpenModalSuccess(true)
      }
    } else {
      const { isSuccess, eventId } = await setEvent(eventData)
      if (isSuccess) {
        const promises: Promise<any>[] = []
        selectedListMember.map((member) => {
          const eventDetail = { ...member, eventId }
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
  }

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

  const handleGenerate = () => {
    const sortListBillOwner = listBillOwner.sort((a, b) => (a.count || 0) - (b.count || 0))
    const memberToPayNew = sortListBillOwner.pop()
    // const memberPayIdNew = memberToPayNew?.uid
    // const memberPayIdOld = memberToPayState?.uid
    // const tempMembers = _.cloneDeep(selectedListMember)
    // const indexNew = tempMembers.findIndex((u) => u.uid === memberPayIdNew)
    // const indexOld = tempMembers.findIndex((u) => u.uid === memberPayIdOld)
    // if (indexNew > -1) {
    //   tempMembers[indexNew].isPaid = true
    // }
    // if (indexOld > -1) {
    //   tempMembers[indexOld].isPaid = false
    // }
    // setSelectedListMember(tempMembers)
    setListBillOwner(sortListBillOwner)
    if (memberToPayNew && memberToPayNew.uid && memberToPayNew.email) {
      setMemberToPayState(memberToPayNew)
      setEventState({ ...eventState, userPayId: memberToPayNew.uid, userPayName: memberToPayNew.name ? memberToPayNew.name : memberToPayNew.email })
    }
  }

  const handleCloseModalSuccess = () => {
    setOpenModalSuccess(false)
    navigate('/')
  }

  useEffect(() => {
    setListBillOwner([...selectedListMember])
  }, [selectedListMember])
  useEffect(() => {
    const bonus = calBonus(eventState.billAmount || 0, eventState.tip || 0)
    const total = (eventState.billAmount || 0) + bonus
    setEventState({ ...eventState, totalAmount: total })
  }, [eventState.billAmount])

  return (
    <div>
      <button className="px-4">
        <Link to="/">
          <ReplyIcon fontSize={'large'} />
        </Link>
      </button>
      <div className="text-center font-[Bellota] text-[24px]">Tạo mới hoá đơn</div>

      <CardStyled variant="outlined" className="mx-5 md:px-3 md:max-w-xl" sx={{ marginTop: '30px', marginBottom: '15px', overflow: 'scroll' }}>
        <CardContent>
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
              helperText="Vui lòng nhập tên"
            />
          </Box>
          <Box className="mt-6">
            <DatePicker
              className="w-full "
              label="Thời gian"
              value={dayjs(eventState?.date)}
              onChange={(newValue) => {
                handleChangeTextField('date', dayjs(newValue).format('DD/MM/YYYY'))
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
          <Box className="flex items-center mt-3">
            <Typography variant="subtitle2">Thành viên</Typography>
            &nbsp; {selectedListMember?.length || 0}
            <ButtonStyled>
              <AddIcon
                color="success"
                onClick={() => {
                  setOpen(true)
                }}
              />
            </ButtonStyled>
          </Box>
          {selectedListMember.length > 0 ? (
            <>
              <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                <ListItem disablePadding>
                  <Typography className="min-w-fit" variant="subtitle2">
                    Đã trả
                  </Typography>
                  <Box className="min-w-[100px] ml-5">
                    <Typography variant="subtitle2">Tên</Typography>
                  </Box>
                  <Box className="ml-5">
                    <Typography className="min-w-[100px]" variant="subtitle2">
                      Bill
                    </Typography>
                  </Box>
                  <Box className="ml-5">
                    <Typography className="min-w-[100px]" variant="subtitle2">
                      Thành Tiền
                    </Typography>
                  </Box>
                </ListItem>
                {selectedListMember.map((member) => {
                  const labelId = `checkbox-list-label-${member.uid}`

                  return (
                    <ListItem key={member.uid} disablePadding>
                      <ListItemIcon onClick={() => (member.uid ? handleToggle(member.uid) : undefined)}>
                        <Checkbox
                          edge="start"
                          // checked={checked.includes(member.uid) !== -1}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </ListItemIcon>
                      <Box className="ml-5 min-w-[100px]">
                        <Typography noWrap>
                          <Tooltip title={member.name || member.email}>
                            <span> {member.name || member.email} </span>
                          </Tooltip>
                        </Typography>
                      </Box>
                      <Box className="ml-5 min-w-[100px]">
                        <TextNumberInput
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
                      </Box>
                      <Box className="ml-5 min-w-[100px]">
                        <TextNumberInput
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
                      </Box>
                      <ButtonStyled onClick={() => handleDelete(member)}>
                        <DeleteIcon />
                      </ButtonStyled>
                    </ListItem>
                  )
                })}
              </List>
              <Box className="w-full flex justify-end mt-3">
                <ButtonStyled variant="contained" className="mt-6" onClick={handleShareBill}>
                  <Typography>Chia đều</Typography>
                </ButtonStyled>
              </Box>
            </>
          ) : null}
          <Typography variant="subtitle2">Người trả bill</Typography>
          <Box sx={{ flexGrow: 1 }} className="mt-2">
            <Grid container spacing={2}>
              <Grid item md={4} xs={5} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ButtonStyled variant="contained" onClick={handleGenerate} disabled={!listBillOwner.length}>
                  <Typography>Auto Pick</Typography>
                </ButtonStyled>
                <Tooltip title="Chọn thành viên trước khi pick người chủ chi" placement="top-start">
                  <ErrorOutlineIcon sx={{ marginTop: '-16px', fontSize: '20px', marginLeft: '3px', color: '#9c9c9c' }} />
                </Tooltip>
              </Grid>
              <Grid item md={8} xs={7}>
                <TextFieldStyled
                  fullWidth
                  disabled
                  value={eventState.userPayName || eventState.userPayId}
                  id="filled-required"
                  variant="standard"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
          <Box className="mt-5">
            <TextNumberInput
              allowLeadingZeros={false}
              fullWidth
              variant="standard"
              label="Bill"
              value={eventState?.billAmount}
              onValueChange={(values) => {
                handleChangeBill(round(_.toNumber(values.value), 3))
              }}
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue={0}
            />
          </Box>
          <Box className="mt-5 flex items-center">
            <FormControl>
              <FormLabel>Hoa hồng</FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-form-control-label-placement"
                name="position"
                defaultValue="top"
                onChange={(e) => {
                  setBonusType(e.target.value as bonusTypeEnum)
                }}
              >
                <FormControlLabel value={bonusTypeEnum.MONEY} checked={bonusType === bonusTypeEnum.MONEY} control={<Radio />} label="Nhập số" />
                <FormControlLabel value={bonusTypeEnum.PERCENT} checked={bonusType === bonusTypeEnum.PERCENT} control={<Radio />} label="Phần trăm" />
              </RadioGroup>
            </FormControl>
            <TextNumberInput
              value={eventState?.tip}
              onChange={(e) => {
                handleChangeTip(_.toNumber(e.target.value))
              }}
              InputProps={{
                endAdornment: bonusType === bonusTypeEnum.PERCENT ? <InputAdornment position="end">%</InputAdornment> : null,
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
              fullWidth
              id="filled-required"
              label="Tổng tiền"
              value={eventState?.totalAmount}
              variant="standard"
              disabled
              InputLabelProps={{
                shrink: true,
              }}
              defaultValue={0}
            />
          </Box>
          <Box className="flex justify-center my-7">
            <ButtonStyled variant="contained" onClick={handleCreateEvent} disabled={!eventState.eventName}>
              <Typography>Tạo hóa đơn</Typography>
            </ButtonStyled>
          </Box>
        </CardContent>
      </CardStyled>
      <PeopleModal open={open} setOpen={setOpen} handleSelectedMember={handleSelectedMember} selectedListMember={selectedListMember} />
      <Modal open={openModalSuccess} onClose={handleCloseModalSuccess} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography variant="h5">thành công</Typography>
        </Box>
      </Modal>
    </div>
  )
}

export default Add
