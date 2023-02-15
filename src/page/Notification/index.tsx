import { updateLastTimeCheckNoti } from '@app/libs/api/noti'
import { getUserByUid } from '@app/libs/api/userAPI'
import { FORMAT__DATE } from '@app/libs/constant'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { isLastPageSelector, listNotiSelector, setReadAllNoti, setUserReadNoti, updateNewNotiCount, updateNoti } from '@app/stores/noti'
import { userStore } from '@app/stores/user'
import { Box, Button, Container } from '@mui/material'
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
    <Container>
      <div className="flex flex-col justify-start">
        <div className="mt-[1.875rem] mb-[0.875rem]">
          <Typography sx={{ fontSize: '1.5rem', lineHeight: '1.875rem', textAlign: 'center' }}>Thông báo</Typography>
        </div>
        <Box className="flex justify-end mb-3 w-11/12">
          <Button variant="outlined" onClick={handleReadAllNoti}>
            read all
          </Button>
        </Box>
        <div className="flex flex-col content-center overflow-y-auto mx-auto w-11/12 max-w-md">
          <InfinitScroll hasMore={!isLastPage} next={updateNotiList} loader={<p>Loading...</p>} dataLength={listCard.length}>
            {listCard}
          </InfinitScroll>
        </div>
      </div>
    </Container>
  )
}
