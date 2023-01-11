import React, { useState } from 'react'
import { User } from '@app/server/firebaseType'
import Search from '@app/page/Members/Search'
import { useAppSelector } from '@app/stores/hook'
import { listUserStore } from '@app/stores/listUser'
import MemberCard from '@app/page/Members/MemberCard'
import { Link } from 'react-router-dom'

const Members = () => {
  const userList = useAppSelector(listUserStore)
  const [users, setUsers] = useState<User[]>(userList)

  const handleSubmit = (query: string) => {
    console.log(query)
    const filteredUserList = users.filter((user) => user.name?.toLowerCase().includes(query))
    console.log(filteredUserList)
    setUsers(filteredUserList)
  }

  return (
    <div className="flex flex-col items-center pt-6 pb-12">
      <h1 className="font-bellota text-center text-3xl pb-4">Thành viên</h1>
      <Search onSubmit={handleSubmit} />
      <div className="pt-6 flex flex-col gap-4">
        {users.length === 0 ? (
          <div>Team Front-end không có ai cả!</div>
        ) : (
          users.map((user) => (
            <Link to={'/profile/' + user.uid} key={user.uid}>
              <MemberCard user={user} />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

export default Members
