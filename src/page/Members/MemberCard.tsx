import ProfilePicture from '@app/assets/profile-picture.png'
import { PAGES } from '@app/contants'
import { getHomeDataByUid } from '@app/libs/api/home'
import { setCurrentPage } from '@app/stores/footer'
import { useAppDispatch } from '@app/stores/hook'
import React, { useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MemberCard = ({ user }) => {
  const dispatch = useAppDispatch()

  const [listEvent, setListEvent] = useState({})

  useEffect(() => {
    dispatch(setCurrentPage(PAGES.HOME))

    getHomeDataByUid(user.uid).then((e) => {
      setListEvent(e)
    })
  }, [dispatch, user.uid])

  return (
    <div className="bg-white px-1 py-3 rounded-xl flex items-center gap-2" key={user.uid}>
      {user.photoURL ? (
        <img src={user.photoURL} alt="User profile" className="w-14 h-14 rounded-full shadow-lg" />
      ) : (
        <img src={ProfilePicture} alt="User profile" className="w-14 h-14 rounded-full shadow-lg" />
      )}
      <div className="flex flex-col pr-1">
        <p>{user.name}</p>
        <p>
          <span>Chủ chi</span>: {listEvent.isHostCount} lần |<span> Tham gia</span>: {listEvent.isMemberCount} lần
        </p>
      </div>
    </div>
  )
}

export default MemberCard
