import { LoadingScreen } from '@app/components/Suspense'
import { deleteEvent } from '@app/libs/api/event'
import { updateEventDetail } from '@app/libs/api/EventApi'
import { createNoti, IsDemandPaymentNoticed, IsPaymentNoticed } from '@app/libs/api/noti'
import { TEXT__HOST, TEXT__MEMBER, TEXT__PAYMENT_PAID, TEXT__PAYMENT_PAID_MSG, TEXT__PAYMENT_REMIND, TEXT__PAYMENT_REMIND_MSG } from '@app/libs/constant'
import { formatMoney } from '@app/libs/functions'
import { auth } from '@app/server/firebase'
import { IEventDetail } from '@app/server/firebaseType'
import { useAppSelector } from '@app/stores/hook'
import { listEventStore } from '@app/stores/listEvent'
import { listEventDetailStore } from '@app/stores/listEventDetail'
import { listUserStore } from '@app/stores/listUser'
import { userStore } from '@app/stores/user'
import TextareaAutosize from '@mui/base/TextareaAutosize'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import DeleteIcon from '@mui/icons-material/Delete'
import DoneIcon from '@mui/icons-material/Done'
import EditIcon from '@mui/icons-material/Edit'
import ReplyIcon from '@mui/icons-material/Reply'
import { Typography } from '@mui/material'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Snackbar from '@mui/material/Snackbar'
import Tooltip from '@mui/material/Tooltip'
import { Container } from '@mui/system'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useNavigate, useParams } from 'react-router-dom'

import { bonusTypeEnum } from './Add'

const LunchDetail = () => {
  // navigate
  const navigate = useNavigate()
  // params
  const params = useParams<{ id: string }>()
  const [loggedInUser] = useAuthState(auth)
  //store
  const { uid: loginUserUid } = useAppSelector(userStore)!
  const listEventDetail = useAppSelector(listEventDetailStore)
  const listEvent = useAppSelector(listEventStore)
  const listUser = useAppSelector(listUserStore)

  // calc - memo
  const userInEvent = useMemo(() => listEventDetail.filter((event) => event.eventId === params.id), [listEventDetail, params])
  const eventInfo = useMemo(() => listEvent.find((item) => item.id === params.id), [listEvent, params.id])
  console.log('user', loggedInUser?.uid)

  // state
  const [loggedUserNote, setLoggedUserNote] = useState(userInEvent.find((item) => item.uid === (loggedInUser?.uid || ''))?.note || '')
  const [openAlert, setOpenAlert] = useState('')
  const [loading, setLoading] = useState(true)
  const [disableNoti, setDisableNoti] = useState<boolean>(false)
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false)

  const isHost = useMemo(() => eventInfo?.userPayId === loginUserUid, [eventInfo?.userPayId, loginUserUid])
  const hostInfo = useMemo(() => listUser.find((user) => user.uid === eventInfo?.userPayId), [eventInfo?.userPayId, listUser])
  const isPaid = useMemo(() => {
    const member = userInEvent.find((member) => member.uid === loginUserUid)
    if (member && member.uid !== eventInfo?.userPayId) {
      return member.isPaid
    } else {
      return !userInEvent.find((member) => !member.isPaid)
    }
  }, [eventInfo?.userPayId, loginUserUid, userInEvent])

  //handle
  const handleClick = () => {
    navigator.clipboard.writeText(listUser.find((user) => user.uid === eventInfo?.userPayId)?.bankAccount || '')
    setOpenAlert('Copied!')
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setOpenAlert('')
  }

  useEffect(() => {
    if (eventInfo) {
      setLoading(false)
    }
  }, [eventInfo])
  useEffect(() => {
    async function checkEventNoticed(eventId: string) {
      const isNoticed = isHost ? await IsDemandPaymentNoticed(eventId) : await IsPaymentNoticed(eventId, loginUserUid!)

      setDisableNoti(isNoticed!)
    }
    if (eventInfo) checkEventNoticed(eventInfo.id!)
  }, [eventInfo])

  const handleNoti = useCallback(() => {
    const toUids = isHost ? userInEvent.filter((user) => !user.isPaid && user.uid !== loginUserUid).map((user) => user.uid!) : [eventInfo?.userPayId || '']
    createNoti({
      date: dayjs(Date.now()).unix(),
      content: isHost ? TEXT__PAYMENT_REMIND_MSG : TEXT__PAYMENT_PAID_MSG,
      fromUid: loginUserUid!,
      toUids: toUids,
      eventId: eventInfo?.id || '',
      userSeen: [],
      type: isHost ? 'DemandPayment' : 'PaymentNotice',
    }).then((res) => {
      if (res.isSuccess) {
        setOpenAlert('Đã Thông báo')
      }
    })
  }, [eventInfo, isHost, loginUserUid, userInEvent])

  const handleCloseDialog = () => {
    setConfirmDialog(false)
  }

  const handleDeleteEvent = useCallback(async () => {
    setLoading(true)
    await deleteEvent(params.id!).then((isSuccess) => {
      if (isSuccess) {
        navigate('..')
        setConfirmDialog(false)
      }
    })
  }, [params, navigate])

  const handleAddNote = async (memberId: string) => {
    try {
      const tempLoggedMember: IEventDetail = userInEvent.find((item: IEventDetail) => item.id === memberId)!
      await updateEventDetail(memberId, { ...tempLoggedMember, note: loggedUserNote })
      setAlertMessage('Cập nhật member note thành công!')
      setIsEditingNote(false)
    } catch (e) {
      setAlertMessage('Lỗi khi cập nhật member note')
      console.log('ERROR WHEN UPDATE NOTE', e)
      setIsEditingNote(false)
    }
  }

  const handleCloseAlert = () => {
    setAlertMessage('')
  }
  console.log(eventInfo)
  return loading ? (
    <LoadingScreen />
  ) : (
    <div className="bg-white">
      <Dialog open={confirmDialog} onClose={handleCloseDialog} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Bạn có chắc chắn muốn xoá?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography>
              Thao tác này không thể hoàn tác.
              <br /> Mọi thành viên có trong bill cũng sẽ không nhìn thấy bill này nữa.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleCloseDialog}>
            <Typography>Để tôi suy nghĩ lại</Typography>
          </Button>
          <Button onClick={handleDeleteEvent} variant="outlined" color="error" startIcon={<DeleteIcon />}>
            <Typography>Xoá!</Typography>
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!openAlert} autoHideDuration={1500} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%', backgroundColor: '#baf7c2' }}>
          <span className="font-bold">{openAlert}</span>
        </Alert>
      </Snackbar>
      <div className="bg-gradient-to-t from-green-300 to-light-color rounded-b-3xl">
        <Container>
          <div className="flex justify-between p-3">
            <Tooltip title="Quay lại trang trước">
              <button
                className="h-[36px]"
                onClick={() => {
                  navigate('/events')
                }}
                aria-label="Quay lại trang trước"
              >
                <ReplyIcon fontSize={'large'} />
              </button>
            </Tooltip>
            <div className="flex flex-col text-center">
              <div className={'mx-auto relative mb-5 rounded-full border-4 p-1 ' + (isHost ? 'border-red-500' : 'border-green-500')}>
                <img
                  src={hostInfo?.photoURL || 'https://picsum.photos/200/300?grayscale'}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-full"
                  alt=""
                />
                <span
                  className={
                    'absolute py-1 px-2 block font-normal text-white rounded-lg -bottom-5 inset-x-2/4 -translate-x-2/4 text-[14px] ' +
                    (isHost ? 'bg-red-600 w-[70px]' : 'bg-green-600 w-[80px]')
                  }
                >
                  {isHost ? TEXT__HOST : TEXT__MEMBER}
                </span>
              </div>
              <h2 className="text-2xl text-center mb-2">{eventInfo?.eventName}</h2>
              <time className="mb-2">{dayjs(eventInfo?.date).format('DD/MM/YYYY')}</time>
              <div className="my-4 flex-wrap">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-left">
                    <tbody>
                      <tr>
                        <th scope="row" className="font-normal pr-4">
                          {TEXT__HOST}
                        </th>
                        <td>
                          <b>{eventInfo?.userPayName || 'Chưa chọn chủ trì'}</b>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="font-normal pr-4">
                          Tham gia
                        </th>
                        <td>
                          <b>{userInEvent?.length} người</b>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="font-normal pr-4">
                          Nhóm
                        </th>
                        <td>
                          <b>{eventInfo?.groupName}</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              {isHost || !hostInfo ? (
                <Tooltip title="Chỉnh sửa bữa ăn">
                  <button aria-label="Chỉnh sửa bữa ăn" className="h-[36px]" onClick={() => navigate(`/events/edit/${params.id}`)}>
                    <BorderColorIcon fontSize={'large'} />
                  </button>
                </Tooltip>
              ) : (
                <div className="h-[36px] w-[36px]"></div>
              )}
            </div>
          </div>
        </Container>
      </div>
      <Container>
        <div className="py-3 px-5">
          <div className="flex justify-between">
            <span className="text-gray-400 font-bold block mb-3">Tổng bill</span>
            <p className="text-end">
              <span className="text-black">{formatMoney(eventInfo?.billAmount)}</span>
            </p>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 font-bold block mb-3">Hoa hồng</span>
            <p className="text-end">
              <span className="text-black">{eventInfo?.bonusType === bonusTypeEnum.MONEY ? formatMoney(eventInfo?.tip) : eventInfo?.tip + '%'}</span>
            </p>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 font-bold block mb-3">Tổng tiền</span>
            <p className="text-end">
              <span className="text-black">{formatMoney(eventInfo?.totalAmount)}</span>
            </p>
          </div>
          <div className="border-y-[1px] border-gray-400">
            <div className="relative overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 font-bold">
                    <th scope="col" className="py-3">
                      Thành viên
                    </th>
                    <th scope="col" className="py-3 pl-5 text-right">
                      Bill
                    </th>
                    <th scope="col" className="py-3 pl-10 text-right">
                      Pay
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userInEvent.map((user) => (
                    <>
                      <tr key={user.uid}>
                        <td>
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-6 h-6 accent-green-600 text-green-600 border-0 rounded-md focus:ring-0"
                              readOnly
                              disabled={!user.isPaid}
                              checked={user.isPaid}
                            />
                            <span className="ml-3">{user.name || user.email}</span>
                          </label>
                        </td>

                        <td className="text-right">{formatMoney(user.amount, false)} K</td>
                        <td className="text-right">{formatMoney(user.amountToPay, false)} K</td>
                      </tr>

                      <tr key={`user-note-${user.uid}`}>
                        <td className="w-full pb-[10px] italic text-[14px] text-[#9c9c9c]">
                          {loggedInUser?.uid === user.uid && isEditingNote && (
                            <Tooltip title={loggedUserNote}>
                              <TextareaAutosize
                                value={loggedUserNote || user.note}
                                onChange={(e) => setLoggedUserNote(e.target.value)}
                                aria-label="minimum height"
                                minRows={2}
                                maxRows={5}
                                placeholder="Note"
                                style={{ width: '100%', border: '1px solid gray', padding: '3px 5px' }}
                              />
                            </Tooltip>
                          )}
                          {loggedInUser?.uid === user.uid && !isEditingNote && loggedUserNote && <>{`"${loggedUserNote}"`}</>}
                          {loggedInUser?.uid === user.uid && !isEditingNote && !loggedUserNote && user.note && <>{user.note}</>}
                          {loggedInUser?.uid === user.uid && !isEditingNote && !loggedUserNote && !user.note && <> no note</>}
                          {loggedInUser?.uid !== user.uid && user.note && <>`{user.note}`</>}
                        </td>
                        <td className="pb-[10px] text-center">
                          {loggedInUser?.uid === user.uid && (
                            <>
                              {isEditingNote ? (
                                <DoneIcon sx={{ color: 'green', cursor: 'pointer' }} onClick={() => handleAddNote(user.id || '')} />
                              ) : (
                                <Tooltip title="Sửa note">
                                  <EditIcon
                                    onClick={() => {
                                      setIsEditingNote(true)
                                    }}
                                    sx={{ cursor: 'pointer' }}
                                  />
                                </Tooltip>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="text-right text-gray-500">
                    <td colSpan={3}>
                      <em className="text-sm">
                        * Đơn vị tính <b>K VNĐ</b>
                      </em>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div>
            <span className="text-gray-400 font-bold block mb-3 pt-[10px]">Note</span>
            <div className="italic text-[#9c9c9c]"> {eventInfo?.note ? `"${eventInfo.note}"` : 'No note'} </div>
          </div>
          <div className=" block mb-3 pt-[10px] border-t-[1px] border-gray-400">
            <div className="text-gray-400 font-bold">Ảnh hoá đơn</div>
            {eventInfo?.photoURL ? (
              <img className="w-96 h-auto mx-auto" src={eventInfo?.photoURL || ''} referrerPolicy="no-referrer" alt={'Không có ảnh bill'} />
            ) : (
              <span>No image</span>
            )}
          </div>
          {!isPaid ? (
            <>
              <div className="my-3 border-y-[1px] border-gray-400 pb-[10px]">
                <span className="text-gray-400 font-bold block mb-3">Bank Account</span>
                <p>
                  Chủ tài khoản: {hostInfo?.bankAccountName} <br />
                  Ngân hàng: {hostInfo?.bankName} <br />
                  Số Tài khoản: <b>{hostInfo?.bankAccount}</b>{' '}
                  <button className="px-2 rounded bg-gray-300 mb-3" onClick={handleClick}>
                    Copy
                  </button>
                  <img
                    className="w-96 h-auto mx-auto"
                    src={hostInfo?.qrCodeURL || ''}
                    referrerPolicy="no-referrer"
                    alt={hostInfo?.bankName || '' + ' - ' + hostInfo?.bankAccount || ''}
                  />
                </p>
              </div>
              <div className="my-3">
                <span className="text-gray-400 font-bold block mb-3">Action</span>
                <div className="flex w-full">
                  <button
                    type="button"
                    onClick={handleNoti}
                    className={
                      'focus:outline-none text-white focus:ring-4 font-medium rounded-lg px-5 py-2.5 mx-auto ' +
                      (isHost ? 'bg-green-600 hover:bg-green-700 focus:ring-green-400 ' : 'bg-[#B91D37] ') +
                      (disableNoti ? 'cursor-not-allowed hover:bg-green-600' : '')
                    }
                  >
                    {isHost ? TEXT__PAYMENT_REMIND : TEXT__PAYMENT_PAID}
                  </button>
                </div>
              </div>
              {(isHost || !hostInfo) && (
                <div className="my-3">
                  <span className="text-gray-400 font-bold block mb-3">Danger Zone</span>
                  <div className="flex w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDialog(true)
                      }}
                      className={'focus:outline-none text-white font-medium rounded-lg px-5 py-2.5 mx-auto bg-red-600 hover:bg-red-700 focus:ring-red-400'}
                    >
                      Xoá Bill
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="my-3">
              <img className="w-96 h-auto mx-auto" src="/paid.png" alt="aaa" />
            </div>
          )}
        </div>
      </Container>
      <Snackbar open={!!alertMessage} autoHideDuration={1500} onClose={handleCloseAlert} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%', backgroundColor: '#baf7c2' }}>
          <span className="font-bold"> {alertMessage} </span>
        </Alert>
      </Snackbar>
    </div>
  )
}

export default LunchDetail
