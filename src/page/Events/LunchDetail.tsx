import { LoadingScreen } from '@app/components/Suspense'
import { deleteEvent } from '@app/libs/api/event'
import { createNoti, IsDemandPaymentNoticed, IsPaymentNoticed } from '@app/libs/api/noti'
import { TEXT__HOST, TEXT__MEMBER, TEXT__PAYMENT_PAID, TEXT__PAYMENT_PAID_MSG, TEXT__PAYMENT_REMIND, TEXT__PAYMENT_REMIND_MSG } from '@app/libs/constant'
import { formatMoney } from '@app/libs/functions'
import { useAppSelector } from '@app/stores/hook'
import { listEventStore } from '@app/stores/listEvent'
import { listEventDetailStore } from '@app/stores/listEventDetail'
import { listUserStore } from '@app/stores/listUser'
import { userStore } from '@app/stores/user'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import DeleteIcon from '@mui/icons-material/Delete'
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
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { bonusTypeEnum } from './Add'
const LunchDetail = () => {
  // navigate
  const navigate = useNavigate()
  // params
  const params = useParams<{ id: string }>()

  //store
  const { uid } = useAppSelector(userStore)!
  const listEventDetail = useAppSelector(listEventDetailStore)
  const listEvent = useAppSelector(listEventStore)
  const listUser = useAppSelector(listUserStore)

  // state
  const [openAlert, setOpenAlert] = useState('')
  const [loading, setLoading] = useState(true)
  const [disableNoti, setDisableNoti] = useState<boolean>(false)
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false)

  // calc - memo
  const userInEvent = useMemo(() => listEventDetail.filter((event) => event.eventId === params.id), [listEventDetail, params])
  const eventInfo = useMemo(() => listEvent.find((item) => item.id === params.id), [listEvent, params.id])

  const isHost = useMemo(() => eventInfo?.userPayId === uid, [eventInfo?.userPayId, uid])
  const hostInfo = useMemo(() => listUser.find((user) => user.uid === eventInfo?.userPayId), [eventInfo?.userPayId, listUser])
  const isPaid = useMemo(() => {
    const member = userInEvent.find((member) => member.uid === uid)
    if (member && member.uid !== eventInfo?.userPayId) {
      return member.isPaid
    } else {
      return !userInEvent.find((member) => !member.isPaid)
    }
  }, [eventInfo?.userPayId, uid, userInEvent])

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
      const isNoticed = isHost ? await IsDemandPaymentNoticed(eventId) : await IsPaymentNoticed(eventId)
      console.log(isNoticed)
      setDisableNoti(isNoticed!)
    }
    if (eventInfo) checkEventNoticed(eventInfo.id!)
  }, [eventInfo])

  const handleNoti = useCallback(() => {
    setDisableNoti(true)
    createNoti({
      date: dayjs(Date.now()).unix(),
      content: isHost ? TEXT__PAYMENT_REMIND_MSG : TEXT__PAYMENT_PAID_MSG,
      fromUid: uid!,
      toUids: isHost ? userInEvent.filter((user) => !user.isPaid).map((user) => user.uid!) : [eventInfo?.userPayId || ''],
      eventId: eventInfo?.id || '',
      userSeen: [],
      type: isHost ? 'DemandPayment' : 'PaymentNotice',
    }).then((res) => {
      if (res.isSuccess) {
        setOpenAlert('Đã Thông báo')
      }
    })
  }, [eventInfo, isHost, uid, userInEvent])

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

  return loading ? (
    <LoadingScreen />
  ) : (
    <div className="bg-white flex flex-col">
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
        <div className="flex justify-evenly p-3">
          <button
            className="h-[36px]"
            onClick={() => {
              history.back()
            }}
          >
            <ReplyIcon fontSize={'large'} />
          </button>
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
                  'absolute py-1 px-2 block font-normal text-white rounded-lg -bottom-5 inset-x-2/4 -translate-x-2/4 ' +
                  (isHost ? 'bg-red-600 w-[70px]' : 'bg-green-600 w-[80px]')
                }
              >
                {isHost ? TEXT__HOST : TEXT__MEMBER}
              </span>
            </div>
            <h2 className="text-2xl text-center mb-2">{eventInfo?.eventName}</h2>
            <time className="mb-2">{eventInfo?.date}</time>
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
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div>
            {isHost || !hostInfo ? (
              <button className="h-[36px]" onClick={() => navigate(`/events/edit/${params.id}`)}>
                <BorderColorIcon fontSize={'large'} />
              </button>
            ) : (
              <div className="h-[36px] w-[36px]"></div>
            )}
          </div>
        </div>
      </div>
      <div className="py-3 px-5 lg:w-[900px] md:w-[600px] self-center">
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
                  <th scope="col" className="py-3 text-center">
                    Bill
                  </th>
                  <th scope="col" className="py-3 text-right">
                    Pay
                  </th>
                </tr>
              </thead>
              <tbody>
                {userInEvent.map((user) => (
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
                    <td className="text-center">{formatMoney(user.amount, false)}</td>
                    <td className="text-right">{formatMoney(user.amountToPay, false)}</td>
                  </tr>
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
        {!isPaid ? (
          <>
            <div className="my-3">
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
                  disabled={disableNoti}
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
    </div>
  )
}

export default LunchDetail
