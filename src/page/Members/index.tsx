import ProfilePicture from '@app/assets/profile-picture.png'
import { getListUser } from '@app/libs/api/EventApi'
import { User } from '@app/server/firebaseType'
import SearchIcon from '@mui/icons-material/Search'
import React, { useEffect, useState } from 'react'

const Members = () => {
  const [users, setUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    getListUser().then((data) => {
      setAllUsers(data)
      setUsers(data)
    })
  }, [])

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

  const onChangeSearch = (event: any) => {
    const searchText = event.target.value
    if (!searchText) {
      setUsers(allUsers)
    }
    const lowerSearchText = searchText.toLowerCase()
    const searchResult = allUsers.filter((item) => item.name?.toLowerCase()?.includes(lowerSearchText))
    setUsers(searchResult)
  }

  return (
    <div className="flex flex-col items-center pt-6 pb-12">
      <h1 className="font-bellota text-center text-3xl pb-4">Thành viên</h1>
      <div>
        <input type="text" onChange={onChangeSearch} className="rounded-full max-w-xs px-6 py-2.5 min-w-[270px] md:min-w-[400px]" placeholder="Search" />
        <button className="ml-2">
          <SearchIcon fontSize={'large'} />
        </button>
      </div>
      <div className="pt-6 flex flex-col gap-4">
        {users.length === 0 && <div>Team Front-end không có ai cả!</div>}
        {membersList}
      </div>
    </div>
  )
}

export default Members
