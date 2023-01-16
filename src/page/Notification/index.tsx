import { setUserSeen } from '@app/libs/api/noti'
import { getUserByUid } from '@app/libs/api/userAPI'
import { FORMAT__DATE } from '@app/libs/constant'
import { INoti } from '@app/server/firebaseType'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { initializeNotiList, isLastPageSelector, listNotiSelector, setUserReadNoti, updateNoti } from '@app/stores/noti'
import { userStore } from '@app/stores/user'
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

  useEffect(() => {
    if (listNoti.length <= 0) dispatch(initializeNotiList(userInfo?.uid!))
  }, [])

  useEffect(() => {
    async function createCard() {
      const listUser = await Promise.all(listNoti.map((noti) => getUserByUid(noti.fromUid!)))

      const listCard = listNoti.map((noti, index) => {
        return (
          <>
            <div className="mb-[0.625rem]" key={noti.id}>
              <NotificationCard
                link={`/events/${noti.eventId}`}
                time={`${dayjs(noti.date * 1000).format(FORMAT__DATE)}`}
                content={
                  <p>
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
          </>
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
          <p className="leading-[1.875rem] text-[1.5rem] text-center font-bellota">Thông báo</p>
        </div>
        <div className="flex flex-col mx-auto px-2">
          <InfinitScroll hasMore={!isLastPage} next={updateNotiList} loader={<p>Loading...</p>} dataLength={listCard.length}>
            {listCard}
          </InfinitScroll>
        </div>
      </div>
    </>
  )
}
