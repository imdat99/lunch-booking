import Wrapper from '@app/components/Wrapper'
import { updateLastTimeCheckNoti } from '@app/libs/api/noti'
import { getUserByUid } from '@app/libs/api/userAPI'
import { formatDate } from '@app/libs/functions'
import { INoti } from '@app/server/firebaseType'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { isLastPageSelector, listNotiSelector, setReadAllNoti, setUserReadNoti, updateNewNotiCount, updateNoti } from '@app/stores/noti'
import { userStore } from '@app/stores/user'
import { Box, Button, Grid, Typography } from '@mui/material'
import { ReactNode, useEffect, useState } from 'react'
import InfinitScroll from 'react-infinite-scroll-component'

import NotificationCard from './NotificationCard'
import { IGroupNoti } from './type'

export default function Notification() {
  const listNoti = useAppSelector(listNotiSelector)
  const isLastPage = useAppSelector(isLastPageSelector)
  const userInfo = useAppSelector(userStore)
  const dispatch = useAppDispatch()
  const [listCard, setListCard] = useState<ReactNode[]>([])

  const handleReadAllNoti = () => {
    dispatch(setReadAllNoti(userInfo.uid!))
  }
  useEffect(() => {
    upDateCheckTime()
    dispatch(updateNewNotiCount(userInfo.uid!))
    async function upDateCheckTime() {
      await updateLastTimeCheckNoti(userInfo.uid!)
    }
  }, [dispatch, userInfo])

  const groupNotiByDate = (listNoti: INoti[]) => {
    const newListNoti: IGroupNoti[] = []
    if (listNoti && listNoti.length) {
      listNoti.forEach((item) => {
        const itemDate = formatDate(item.date, 'YYYYMMDD')
        const groupNoti = newListNoti.find((group) => formatDate(group.groupDate, 'YYYYMMDD') === itemDate)
        if (groupNoti) {
          groupNoti.notis.push(item)
        } else {
          newListNoti.push({
            groupDate: itemDate,
            notis: [item],
          })
        }
      })
    }
    return newListNoti
  }

  const createCard = async () => {
    const listUser = await Promise.all(listNoti.map((noti) => getUserByUid(noti.fromUid!)))

    const groupNoti: IGroupNoti[] = groupNotiByDate(listNoti)

    const renderItemNoti = (notis: INoti[]) => {
      return notis.map((noti, index) => {
        return (
          <div className="mb-[0.625rem] rounded-3xl block" key={noti.id}>
            <NotificationCard
              link={`/events/${noti.eventId}?history=noti`}
              content={
                <p className="text-black text-[0.875rem] leading-[1.125rem]">
                  Từ <b>{listUser[index]?.name}</b> : {noti.content}
                </p>
              }
              isRead={noti.userSeen.includes(userInfo?.uid || '')}
              avatarSrc={listUser[index]?.photoURL || ''}
              onClick={() => {
                dispatch(setUserReadNoti(userInfo?.uid || '', noti))
              }}
              userInfo={userInfo}
              notiInfo={noti}
            />
          </div>
        )
      })
    }

    const listCard = groupNoti.map((groupItem, index) => {
      return (
        <div key={index}>
          <Typography variant="h5" className="pt-5 pb-2">
            Ngày {formatDate(groupItem.groupDate)}
          </Typography>
          {renderItemNoti(groupItem.notis)}
        </div>
      )
    })
    setListCard(listCard)
  }

  useEffect(() => {
    createCard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listNoti])

  function updateNotiList() {
    dispatch(updateNoti(userInfo.uid!))
  }

  return (
    <Wrapper>
      <Box className="sticky top-0 z-10 pb-4 bg-white border-b-[1px] px-3 rounded-md drop-shadow-lg mb-3">
        <Grid id="header" className="pt-3" container direction="row" alignItems="center">
          <Grid item xs={4} md={2}></Grid>
          <Grid item xs={4} md={8}>
            <p className="font-bellota text-center text-[18px] font-bold">Thông báo</p>
          </Grid>
          <Grid className="flex justify-end mt-10" item xs={4} md={2}>
            <Button variant="outlined" onClick={handleReadAllNoti}>
              Read all
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box className="mb-[0.625rem] rounded-md block drop-shadow-lg">
        <InfinitScroll hasMore={!isLastPage} next={updateNotiList} loader={<p>Loading...</p>} dataLength={listNoti.length}>
          {listCard}
        </InfinitScroll>
      </Box>
    </Wrapper>
  )
}
