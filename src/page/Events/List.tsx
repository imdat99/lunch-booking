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
import { Box, Container } from '@mui/material'
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

  // const onChangeSearch = (event: any) => {
  //   const searchText = event.target.value
  //   if (!searchText) {
  //     setFilterEvents(listEventUser)
  //   }
  //   const lowerSearchText = searchText.toLowerCase()
  //   const searchResult = listEventUser.filter((item) => item.eventName?.toLowerCase()?.includes(lowerSearchText))
  //   setFilterEvents(searchResult)
  // }

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
    <Container
      maxWidth="sm"
      // sx={{
      //   paddingRight: 0,
      //   paddingLeft: 0,
      //   margin: 'auto',
      //   alignItems: 'center',
      //   justifyContent: 'center',
      //   display: 'flex',
      //   flexDirection: 'column',
      //   minWidth: '375px',
      // }}
    >
      <Box className="sticky top-0 mb-3 z-10 bg-white border-b-[1px] rounded-b-xl drop-shadow-lg max-w-[800px] min-w-[375px]">
        <Box className="pt-4 pb-3">
          <Box className="font-bellota text-center text-[18px] font-bold px-3 ">Lịch sử đi ăn</Box>
        </Box>
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
        <div className="flex w-full rounded-lg bg-white items-center justify-between" role="group">
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
      </Box>
      <ul className="min-w-[375px] w-11/12 m-auto">
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
            <li className="mb-[0.625rem] rounded-md block border-[1px] bg-white drop-shadow-lg" key={index}>
              <Link to={item.id!}>
                <Box className="bg-white rounded-3xl flex justify-between p-5 gap-2">
                  <div className="relative">
                    <img src={hostInfo?.photoURL || ''} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full" alt="" />
                    <div
                      className={
                        'absolute py-1 px-1 block font-normal text-white rounded-lg -bottom-0 inset-x-2/4 -translate-x-2/4 text-[14px] w-[70px] text-center ' +
                        (isHost ? 'bg-red-600' : 'bg-green-600 ')
                      }
                    >
                      {isHost ? TEXT__HOST : TEXT__MEMBER}
                    </div>
                  </div>
                  <Box className="w-full max-w-[80%]">
                    <div className="flex justify-between items-center">
                      <div className="text-[14px]">{dayjs(item.date, FORMAT__DATE).format('DD/MM/YYYY')}</div>
                      <div className={'font-bold text-white rounded-xl top-0 right-0 text-[14px] ' + (isPaid ? 'text-green-600' : 'text-red-700')}>
                        {isHost && isPaid && 'Đã hoàn tất'}
                        {isHost && !isPaid && 'Chưa hoàn tất'}
                        {!isHost && isPaid && 'Đã trả'}
                        {!isHost && !isPaid && 'Chưa trả'}
                        {}
                      </div>
                    </div>
                    <div className="w-full relative flex flex-col justify-between text-[14px]">
                      <h3 className="font-medium">{item.eventName}</h3>
                      <span>
                        Chủ chi:&nbsp;
                        <b>{item.userPayName}</b>
                      </span>
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
                  </Box>
                </Box>
              </Link>
            </li>
          )
        })}
      </ul>
    </Container>
  )
}

export default List
