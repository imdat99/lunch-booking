import ProfilePicture from '@app/assets/profile-picture.png'
import { getListUser } from '@app/libs/api/EventApi'
import MemberCard from '@app/page/Members/MemberCard'
import { User } from '@app/server/firebaseType'
import SearchIcon from '@mui/icons-material/Search'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Members = () => {
  const [users, setUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    getListUser().then((data) => {
      setAllUsers(data)
      setUsers(data)
    })
  }, [])

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
        <OutlinedInput
          sx={{ width: '290px', height: '46px', borderRadius: '30px', backgroundColor: 'white' }}
          id="outlined-adornment-password"
          type={'text'}
          endAdornment={
            <InputAdornment position="end">
              <SearchIcon fontSize={'large'} />
            </InputAdornment>
          }
          onChange={onChangeSearch}
        />
      </div>
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
