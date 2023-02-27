import Wrapper from '@app/components/Wrapper'
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
import { Avatar, Box, Button } from '@mui/material'
// import InputAdornment from '@mui/material/InputAdornment'
// import OutlinedInput from '@mui/material/OutlinedInput'
import dayjs from 'dayjs'
import _ from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import React from 'react'
import { Link } from 'react-router-dom'
import { VariableSizeList } from 'react-window'
import { CSSProperties } from 'react'
enum SortType {
  TIME = 'time',
  MEMBERS = 'members',
  PAY = 'pay',
}
type CardProps = {
  index: number
  style: CSSProperties
  data: IEvent[]
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
  const Card = ({ index, style, data }: CardProps) => {
    const cardData = data[index]
    const isHost = userData.uid === cardData.userPayId
    const hostInfo = listUser.find((user) => user.uid === cardData.userPayId)
    const isPaid = isHost
      ? cardData.isAllPaid
      : listEventDetail.find((eventDetail) => eventDetail?.uid === userData.uid && eventDetail.isPaid && eventDetail.eventId === cardData.id)
    const paidMoney = isHost
      ? listEventDetail
          .filter((eventDetail) => eventDetail.eventId === cardData.id && eventDetail.isPaid)
          .reduce((sum, eventDetail) => sum + Number(eventDetail.amountToPay!), 0)
      : 0
    return (
      <Box
        className="rounded-md block border-[1px] bg-white drop-shadow-lg"
        key={index}
        style={{ ...style, top: `${parseFloat(style?.top as string) + 5 * index}px` }}
      >
        <Link to={cardData.id!}>
          <Box className="bg-white rounded-3xl flex p-5 gap-5">
            <Box className="relative max-w-fit">
              <Avatar src={hostInfo?.photoURL || ''} sx={{ width: 72, height: 72, border: '4px solid #1e8d1d70' }} alt="" />
              <Box
                className={
                  'absolute py-1 px-1 block font-normal text-white rounded-lg -bottom-0 inset-x-2/4 -translate-x-2/4 text-[14px] w-[70px] text-center ' +
                  (isHost ? 'bg-red-600' : 'bg-green-600 ')
                }
              >
                {isHost ? TEXT__HOST : TEXT__MEMBER}
              </Box>
            </Box>
            <Box className="w-full">
              <Box className="flex justify-between items-center">
                <Box className="text-[14px]">{dayjs(cardData.date, FORMAT__DATE).format('DD/MM/YYYY')}</Box>
                <Box className={'font-bold text-white rounded-xl top-0 right-0 text-[14px] ' + (isPaid ? 'text-green-600' : 'text-red-700')}>
                  {isHost && isPaid && 'Đã hoàn tất'}
                  {isHost && !isPaid && 'Chưa hoàn tất'}
                  {!isHost && isPaid && 'Đã trả'}
                  {!isHost && !isPaid && 'Chưa trả'}
                  {}
                </Box>
              </Box>
              <Box className="w-full relative flex flex-col justify-between text-[14px]">
                <h3 className="font-medium">{cardData.eventName}</h3>
                <Box component={'span'}>
                  Chủ chi:&nbsp;
                  <b>{cardData.userPayName}</b>
                </Box>
                <Box component={'span'}>
                  Số tiền:&nbsp;
                  <b>
                    {formatMoney(
                      isHost
                        ? Number(cardData.totalAmount)! - paidMoney
                        : listEventDetail?.find((member) => member.uid === userData.uid && member.eventId === cardData.id)?.amountToPay
                    )}
                  </b>
                </Box>
              </Box>
            </Box>
          </Box>
        </Link>
      </Box>
    )
  }
  return (
    <Wrapper>
      <Box className="sticky top-0 mb-3 z-10 bg-white border-b-[1px] rounded-b-xl drop-shadow-lg">
        <Box className="pt-4 pb-3">
          <Box className="font-bellota text-center text-[18px] font-bold px-3 ">Lịch sử đi ăn</Box>
        </Box>
        <Box className="flex w-full rounded-lg bg-white items-center justify-between" role="group">
          {listButton.map((item, index) => (
            <React.Fragment key={index}>
              {index !== 0 && <Divider />}
              <Button className={buttonClassname(index, listButton.length)} onClick={onChangeSort(item.sortType)}>
                {item.title}
                {renderSortIcon(item.sortType)}
              </Button>
            </React.Fragment>
          ))}
        </Box>
      </Box>
      <VariableSizeList className="List" height={(screen.height * 2) / 3} itemCount={data.length} itemSize={() => 150} width={'100%'} itemData={data}>
        {Card}
      </VariableSizeList>
    </Wrapper>
  )
}

export default List
