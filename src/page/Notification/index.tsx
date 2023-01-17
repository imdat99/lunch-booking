import NotificationCard from './NotificationCard'
import { useEffect, useState, ReactNode } from 'react'
import { useAppSelector, useAppDispatch } from '@app/stores/hook'
import { listNotiSelector, initializeNotiList, isLastPageSelector, updateNoti, setUserReadNoti , updateNewNotiCount} from '@app/stores/noti'
import Typography from '@mui/material/Typography';
import { userStore } from '@app/stores/user'
import { getUserByUid } from '@app/libs/api/userAPI'
import { updateLastTimeCheckNoti } from '@app/libs/api/noti'
import InfinitScroll from 'react-infinite-scroll-component'
import dayjs from 'dayjs'
import { FORMAT__DATE } from '@app/libs/constant'

export default function Notification() {
  const listNoti = useAppSelector(listNotiSelector)
  const isLastPage = useAppSelector(isLastPageSelector)
  const userInfo = useAppSelector(userStore)
  const dispatch = useAppDispatch()
  const [listCard, setListCard] = useState<ReactNode[]>([])

  useEffect(() => {
    upDateCheckTime()
    dispatch(updateNewNotiCount(userInfo.uid!))
    async function upDateCheckTime(){
    await  updateLastTimeCheckNoti(userInfo.uid!)
    }
  }, [userInfo])

  useEffect(() => {
    async function createCard() {
      const listUser = await Promise.all(listNoti.map((noti) => getUserByUid(noti.fromUid!)))

      const listCard = listNoti.map((noti, index) => {
        return (
            <div className="mb-[0.625rem]" key={noti.id}>
              <NotificationCard
                link={`/events/${noti.eventId}`}
                time={`${dayjs(noti.date * 1000).format(FORMAT__DATE)}`}
                content={
                  <p className='text-black text-[0.875rem] leading-[1.125rem]'>
                    Từ <b>{listUser[index]?.name}</b> : {noti.content}
                  </p>
                }
                isRead={noti.userSeen.includes(userInfo?.uid!)}
                avatarSrc={listUser[index]?.photoURL!}
                onClick={() => {
                  dispatch(setUserReadNoti(userInfo?.uid!, noti))
                }}
              />
            </div>
        )
      })
      setListCard(listCard)
    }
    createCard()
  }, [listNoti])

  function updateNotiList() {
    dispatch(updateNoti(userInfo?.uid!))
  }

  return (
    <>
      <div className="flex flex-col justify-start">
        <div className="mt-[1.875rem] mb-[1.875rem] h-[5.625rem]">
          <Typography  sx={{fontSize:"1.5rem", lineHeight:"1.875rem",textAlign:"center" }}>Thông báo</Typography>
        </div>
        <div className="flex flex-col content-center overflow-y-auto ">
          <InfinitScroll hasMore={!isLastPage} next={updateNotiList} loader={<p>Loading...</p>} dataLength={listCard.length}>
            {listCard}
          </InfinitScroll>
        </div>
      </div>
    </>
  )
}
