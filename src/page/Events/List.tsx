import { FORMAT__DATE, TEXT__HOST, TEXT__MEMBER, TEXT__PAID, TEXT__UNPAID } from '@app/libs/constant'
import { formatMoney } from '@app/libs/functions'
import { useAppSelector } from '@app/stores/hook'
import { listEventStore } from '@app/stores/listEvent'
import { listEventDetailStore } from '@app/stores/listEventDetail'
import { userStore } from '@app/stores/user'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

const List = () => {
  const userData = useAppSelector(userStore)!
  const listEvent = useAppSelector(listEventStore)
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
  return (
    <main className="flex pb-6 bg-gradient-to-b from-light-green-2 to-light-green-3">
      <div className="mx-auto w-11/12 max-w-md">
        <div className="text-center my-6">
          <h2 className="text-2xl">Lịch sử đi ăn</h2>
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
          {listEventUser
            .sort((a, b) => {
              const date1 = dayjs(a.date, FORMAT__DATE)
              const date2 = dayjs(b.date, FORMAT__DATE)
              return date1.diff(date2)
            })
            .map((item, index) => {
              const isHost = userData.uid === item.userPayId
              const isPaid = isHost ? item.isAllPaid : !(listEventDetail || []).find((member) => member?.uid === userData.uid && member.isPaid)
              return (
                <li className="my-4" key={index}>
                  <Link to={item.id!} className="flex bg-white rounded-3xl p-3">
                    <div className="mx-auto mb-5 p-1 w-1/3">
                      <div className="relative">
                        <img src="https://picsum.photos/200/300?grayscale" className="w-20 h-20 rounded-full mx-auto" alt="" />
                        <span
                          className={
                            'absolute py-1 px-2 block font-normal text-white rounded-lg -bottom-4 inset-x-2/4 -translate-x-2/4 ' +
                            (isHost ? 'bg-red-700 w-[65px]' : 'bg-green-600 w-[80px]')
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
                          Chủ trì:&nbsp;
                          <b>{item.userPayName}</b>
                        </span>
                        <br />
                        <span>
                          Số tiền chưa đòi:
                          <b>{formatMoney(isHost ? item.billAmount : listEventDetail?.find((member) => member.uid === userData.uid)?.amount)}</b>
                        </span>
                      </div>
                      <span
                        className={
                          'absolute py-1 px-3 block font-normal text-white rounded-xl text-xl top-0 right-0 ' + (isPaid ? 'bg-green-600' : 'bg-red-700')
                        }
                      >
                        {isPaid ? TEXT__PAID : TEXT__UNPAID}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
        </ul>
      </div>
    </main>
  )
}

export default List
