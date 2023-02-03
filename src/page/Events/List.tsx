import { FORMAT__DATE, TEXT__HOST, TEXT__MEMBER } from '@app/libs/constant'
import { formatMoney } from '@app/libs/functions'
import { IEvent } from '@app/server/firebaseType'
import { useAppSelector } from '@app/stores/hook'
import { listEventStore } from '@app/stores/listEvent'
import { listEventDetailStore } from '@app/stores/listEventDetail'
import { listUserStore } from '@app/stores/listUser'
import { userStore } from '@app/stores/user'
import SearchIcon from '@mui/icons-material/Search'
import { Container } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const List = () => {
  const userData = useAppSelector(userStore)!
  const listUser = useAppSelector(listUserStore)!
  const listEvent = useAppSelector(listEventStore)
  const [filterEvents, setFilterEvents] = useState<IEvent[]>([])
  const listEventDetail = useAppSelector(listEventDetailStore)
  const eventOfUser = useMemo(
    () =>
      listEventDetail
        .filter((event) => event.uid === userData.uid)
        .map((event) => {
          return event.eventId
        }),
    [listEventDetail, userData]
  )
  const listEventUser = useMemo(() => listEvent.filter((event) => eventOfUser.includes(event.id)), [eventOfUser, listEvent])
  console.log(listEventUser)

  useEffect(() => {
    setFilterEvents(listEventUser)
  }, [listEventUser])

  const onChangeSearch = (event: any) => {
    const searchText = event.target.value
    if (!searchText) {
      setFilterEvents(listEventUser)
    }
    const lowerSearchText = searchText.toLowerCase()
    const searchResult = listEventUser.filter((item) => item.eventName?.toLowerCase()?.includes(lowerSearchText))
    setFilterEvents(searchResult)
  }

  return (
    <Container>
      <div className="mx-auto w-11/12 max-w-md">
        <div className="mt-[1.875rem] mb-[1.875rem]">
          <h2 className="font-bellota text-center text-2xl">Lịch sử đi ăn</h2>
        </div>
        <div className="text-center">
          <OutlinedInput
            sx={{ width: '290px', height: '46px', borderRadius: '30px', backgroundColor: 'white' }}
            id="outlined-adornment-password"
            type={'text'}
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon fontSize={'large'} />
              </InputAdornment>
            }
            onChange={onChangeSearch}
          />
        </div>

        {/* <div className="inline-flex w-full" role="group">
          <button
            disabled
            className="min-w-[50%] py-4 px-4 text-gray-900 border-r-2 border-gray-200 bg-white rounded-l-lg hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 cursor-not-allowed"
          >
            Thời gian
          </button>
          <button
            disabled
            className="min-w-[50%] py-4 px-4 text-gray-900 bg-white rounded-r-lg hover:bg-gray-100 hover:text-green-700 focus:z-10 focus:ring-2 focus:ring-green-700 focus:text-green-700 cursor-not-allowed"
          >
            Thanh toán
          </button>
        </div> */}
        <ul className="mt-10">
          {filterEvents
            .sort((a, b) => {
              const date1 = dayjs(a.date, FORMAT__DATE)
              const date2 = dayjs(b.date, FORMAT__DATE)
              return date2.diff(date1)
            })
            .map((item, index) => {
              const isHost = userData.uid === item.userPayId
              const hostInfo = listUser.find((user) => user.uid === item.userPayId)
              const isPaid = isHost
                ? item.isAllPaid
                : listEventDetail.find((eventDetail) => eventDetail?.uid === userData.uid && eventDetail.isPaid && eventDetail.eventId === item.id)
              const paidMoney = isHost
                ? listEventDetail
                    .filter((eventDetail) => eventDetail.eventId === item.id && eventDetail.isPaid)
                    .reduce((sum, eventDetail) => sum + Number(eventDetail.amountToPay!), 0)
                : 0
              return (
                <li className="my-4" key={index}>
                  <Link to={item.id!} className="flex bg-white rounded-3xl p-3">
                    <div className="mx-auto mb-5 p-1 w-1/3">
                      <div className="relative">
                        <img src={hostInfo?.photoURL || ''} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full mx-auto" alt="" />
                        <span
                          className={
                            'absolute py-1 px-2 block font-normal text-white rounded-lg -bottom-4 inset-x-2/4 -translate-x-2/4 text-center ' +
                            (isHost ? 'bg-red-700 w-[70px]' : 'bg-green-600 w-[80px]')
                          }
                        >
                          {isHost ? TEXT__HOST : TEXT__MEMBER}
                        </span>
                      </div>
                    </div>
                    <div className="w-2/3 relative flex flex-col justify-between">
                      <time>{item.date}</time>
                      <div className="mt-3">
                        <h3 className="font-medium">{item.eventName}</h3>
                        <span>
                          Chủ chi:&nbsp;
                          <b>{item.userPayName}</b>
                        </span>
                        <br />
                        <span>
                          Số tiền:&nbsp;
                          <b>
                            {formatMoney(
                              isHost
                                ? Number(item.totalAmount)! - paidMoney
                                : listEventDetail?.find((member) => member.uid === userData.uid && member.eventId === item.id)?.amountToPay
                            )}
                          </b>
                        </span>
                      </div>
                      <span
                        className={
                          'absolute py-1 px-3 block font-normal text-white rounded-xl text-xl top-0 right-0 text-[16px] ' +
                          (isPaid ? 'bg-green-600' : 'bg-red-700')
                        }
                      >
                        {isHost && isPaid && 'Đã hoàn tất'}
                        {isHost && !isPaid && 'Chưa hoàn tất'}
                        {!isHost && isPaid && 'Đã trả'}
                        {!isHost && !isPaid && 'Chưa trả'}
                        {}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
        </ul>
      </div>
    </Container>
  )
}

export default List
