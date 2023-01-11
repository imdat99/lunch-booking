import { getListUser } from '@app/libs/api/EventApi'
import React, { useEffect, useState } from 'react'
import { User } from '@app/server/firebaseType'
import ProfilePicture from '@app/assets/profile-picture.png'
import Search from '@app/page/Members/Search'

const Members = () => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    getListUser().then((r) => {
      setUsers(r)
    })
  }, [])

  const handleSubmit = (query: string) => {
    console.log(query)
    const filteredUserList = users.filter((user) => {
      return user.name?.toLowerCase().includes(query)
    })
    setUsers(filteredUserList)
  }

  const membersList = users.map((user) => (
    <div className="bg-white px-1 py-3 rounded-xl flex items-center gap-2" key={user.uid}>
      <img src={ProfilePicture} alt="User profile" className="w-14 h-14 rounded-full shadow-lg" />
      <div className="flex flex-col pr-1">
        <p>{user.name}</p>
        <p>
          <span>Chủ chi</span>: 4 lần |<span> Tham gia</span>: 4 lần
        </p>
      </div>
    </div>
  ))

  return (
    <div className="flex flex-col items-center pt-6 pb-12">
      <h1 className="font-bellota text-center text-3xl pb-4">Thành viên</h1>
      <Search onSubmit={handleSubmit} />
      <div className="pt-6 flex flex-col gap-4">
        {users.length === 0 && <div>Team Front-end không có ai cả!</div>}
        {membersList}
      </div>
    </div>
  )
}

export default Members
