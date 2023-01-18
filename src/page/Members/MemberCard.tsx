import ProfilePicture from '@app/assets/profile-picture.png'
import { getHomeDataByUid } from '@app/libs/api/home'
import { useAppDispatch } from '@app/stores/hook'
import React, { useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const MemberCard = ({ user }) => {
  const dispatch = useAppDispatch()

  const [listEvent, setListEvent] = useState<any>({})

  useEffect(() => {
    getHomeDataByUid(user.uid).then((e) => {
      setListEvent(e)
    })
  }, [dispatch, user.uid])

  return (
    <div className="pl-2 py-1.5 rounded-xl flex gap-2.5 font-bellota rounded-3xl max-w-xl" key={user.uid}>
      {user.photoURL ? (
        <div className="mx-auto">
          <img src={user.photoURL} alt="User profile" className="w-12 h-12 rounded-full mx-auto" />
        </div>
      ) : (
        <div className="mx-auto">
          <img src={ProfilePicture} alt="User profile" className="w-12 h-12 rounded-full shadow-lg" />
        </div>
      )}
      <div className="relative justify-between">
        <p className="font-bold">{user.name}</p>
        <p>
          <span>Chủ chi</span>: {listEvent.isHostCount} lần |<span> Tham gia</span>: {listEvent.isMemberCount} lần
        </p>
      </div>
    </div>
  )
}

export default MemberCard
