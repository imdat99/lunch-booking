import { getListUser } from '@app/libs/api/EventApi'
import MemberCard from '@app/page/Members/MemberCard'
import { User } from '@app/server/firebaseType'
import SearchIcon from '@mui/icons-material/Search'
import { Container } from '@mui/material'
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
    <Container>
      <div className="mt-[1.875rem] mb-[1.875rem]">
        <h1 className="font-bellota text-center text-2xl">Thành viên</h1>
      </div>
      <div className="text-center  mb-[1.875rem]">
        <OutlinedInput
          sx={{ width: '290px', height: '46px', borderRadius: '30px', backgroundColor: 'white' }}
          id="outlined-adornment-password"
          type={'text'}
          placeholder={'Tìm kiếm'}
          endAdornment={
            <InputAdornment position="end">
              <SearchIcon fontSize={'large'} />
            </InputAdornment>
          }
          onChange={onChangeSearch}
        />
      </div>
      <div className="flex flex-col content-center overflow-y-auto mx-auto w-11/12 max-w-md">
        {users.length === 0 ? (
          <div>Team Front-end không có ai cả!</div>
        ) : (
          users.map((user) => (
            <div className="mb-[0.625rem] rounded-3xl block" key={user.uid}>
              <Link className="flex bg-white rounded-3xl p-3 max-w-md" to={'/profile/' + user.uid} key={user.uid}>
                <MemberCard user={user} />
              </Link>
            </div>
          ))
        )}
      </div>
    </Container>
  )
}

export default Members
