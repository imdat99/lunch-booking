import { updateLastTimeCheckNoti } from '@app/libs/api/noti'
import { getUserByUid } from '@app/libs/api/userAPI'
import { FORMAT__DATE } from '@app/libs/constant'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { isLastPageSelector, listNotiSelector, setReadAllNoti, setUserReadNoti, updateNewNotiCount, updateNoti } from '@app/stores/noti'
import { userStore } from '@app/stores/user'
import { Box, Button, Container, Grid } from '@mui/material'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { ReactNode, useEffect, useState } from 'react'
import InfinitScroll from 'react-infinite-scroll-component'

import NotificationCard from './NotificationCard'

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

  useEffect(() => {
    async function createCard() {
      const listUser = await Promise.all(listNoti.map((noti) => getUserByUid(noti.fromUid!)))

      const listCard = listNoti.map((noti, index) => {
        return (
          <div className="mb-[0.625rem] rounded-3xl block" key={noti.id}>
            <NotificationCard
              link={`/events/${noti.eventId}`}
              time={`${dayjs(noti.date * 1000).format(FORMAT__DATE)}`}
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
            />
          </div>
        )
      })
      setListCard(listCard)
    }
    createCard()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listNoti])

  function updateNotiList() {
    dispatch(updateNoti(userInfo.uid!))
  }

  return (
    <Container maxWidth="sm">
      <Box className="sticky top-0 z-10 pb-4 bg-white border-b-[1px] px-3 rounded-b-xl drop-shadow-lg mb-3">
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
      <div className="flex flex-col content-center overflow-y-auto mx-auto w-11/12 max-w-md">
        <InfinitScroll hasMore={!isLastPage} next={updateNotiList} loader={<p>Loading...</p>} dataLength={listCard.length}>
          {listCard}
        </InfinitScroll>
      </div>
    </Container>
  )
}
