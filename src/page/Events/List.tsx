import { FORMAT__DATE, TEXT__HOST, TEXT__MEMBER } from '@app/libs/constant'
import { formatMoney } from '@app/libs/functions'
import { IEvent } from '@app/server/firebaseType'
import { useAppSelector } from '@app/stores/hook'
import { listEventStore } from '@app/stores/listEvent'
import { listEventDetailStore } from '@app/stores/listEventDetail'
import { listUserStore } from '@app/stores/listUser'
import { userStore } from '@app/stores/user'
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material'
// import SearchIcon from '@mui/icons-material/Search'
import { Container } from '@mui/material'
// import InputAdornment from '@mui/material/InputAdornment'
// import OutlinedInput from '@mui/material/OutlinedInput'
import dayjs from 'dayjs'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'

enum SortType {
  TIME = 'time',
  MEMBERS = 'members',
  PAY = 'pay',
}

enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

const Divider = () => {
  return <div className="border-l-2 w-[0.5%] h-[35px]" />
}

const buttonClassname = (index: number, length: number) => {
  return `
  text-sm
  max-w-[33%]
  w-full
  flex
  h-[52px]
  py-4
  items-center
  justify-center
  text-gray-900 
  border-gray-200 
  hover:bg-gray-100 
  hover:text-green-700 
  focus:z-10 focus:ring-2 
  focus:ring-green-700 
  focus:text-green-700 
  ${index === 0 && 'rounded-l-lg'} 
  ${index === length - 1 && 'rounded-r-lg'}
  `
}

const List = () => {
  const userData = useAppSelector(userStore)!
  const listUser = useAppSelector(listUserStore)!
  const listEvent = useAppSelector(listEventStore)
  const [filterEvents, setFilterEvents] = useState<IEvent[]>([])
  const [sort, setSort] = useState<Order | undefined>(Order.ASC)
  const [orderBy, setOrderBy] = useState<SortType | undefined>(SortType.TIME)

  const getNextOrder = (key?: string, oldOrder?: Order | undefined) => {
    if (key !== orderBy) return Order.ASC
    if (!oldOrder) return Order.ASC
    if (oldOrder === Order.ASC) return Order.DESC
    return undefined
  }

  const onChangeSort = (key?: SortType) => () => {
    const newOrder = getNextOrder(key, sort)
    setSort(newOrder)
    setOrderBy(key)
  }

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

  const listButton = useMemo(() => {
    return [
      { title: 'Thời gian', sortType: SortType.TIME },
      { title: 'Tham gia', sortType: SortType.MEMBERS },
      { title: 'Thanh toán', sortType: SortType.PAY },
    ]
  }, [])

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

  const handleSort = useCallback(
    (a: IEvent, b: IEvent): number => {
      if (orderBy === SortType.TIME) {
        const date1 = dayjs(a.date, FORMAT__DATE)
        const date2 = dayjs(b.date, FORMAT__DATE)
        if (sort === Order.ASC) {
          return date2.diff(date1)
        }
        if (sort === Order.DESC) {
          return date1.diff(date2)
        }
        return 0
      }
      if (orderBy === SortType.MEMBERS) {
        const member1 = a?.userPayId === userData?.uid
        const member2 = b?.userPayId === userData?.uid
        if (sort === Order.ASC) {
          return Number(member2) - Number(member1)
        }
        if (sort === Order.DESC) {
          return Number(member1) - Number(member2)
        }
        return 0
      }
      if (orderBy === SortType.PAY) {
        const pay1 = !!a?.isAllPaid
        const pay2 = !!b?.isAllPaid
        if (sort === Order.ASC) {
          return Number(pay2) - Number(pay1)
        } else if (sort === Order.DESC) {
          return Number(pay1) - Number(pay2)
        } else return 0
      }
      return 0
    },
    [orderBy, sort, userData?.uid]
  )

  const data = useMemo(() => {
    const cloneFilterEvents = _.cloneDeep(filterEvents)
    const totalData = sort ? cloneFilterEvents.sort((a, b) => handleSort(a, b)) : filterEvents
    return totalData
  }, [filterEvents, handleSort, sort])

  const renderSortIcon = (sortType: SortType) => {
    if (!sort) return null
    if (sortType === orderBy) {
      if (sort === Order.ASC) return <ArrowDropDown />
      return <ArrowDropUp />
    }
  }

  return (
    <Container>
      <div className="mx-auto w-11/12 max-w-md">
        <div className="mt-[1.875rem] mb-[1.875rem]">
          <h2 className="font-bellota text-center text-2xl">Lịch sử đi ăn</h2>
        </div>
        {/* <div className="text-center">
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
        </div> */}
        <div className="flex w-full rounded-lg bg-white items-center justify-between mt-2" role="group">
          {listButton.map((item, index) => (
            <React.Fragment key={index}>
              {index !== 0 && <Divider />}
              <button type="button" className={buttonClassname(index, listButton.length)} onClick={onChangeSort(item.sortType)}>
                {item.title}
                {renderSortIcon(item.sortType)}
              </button>
            </React.Fragment>
          ))}
        </div>
        <ul className="mt-10">
          {data.map((item, index) => {
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
                          (isHost ? 'bg-red-700 w-[70px]' : 'bg-green-600 w-[85px]')
                        }
                      >
                        {isHost ? TEXT__HOST : TEXT__MEMBER}
                      </span>
                    </div>
                  </div>
                  <div className="w-2/3 relative flex flex-col justify-between">
                    <time>{dayjs(item.date, FORMAT__DATE).format('DD/MM/YYYY')}</time>
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
