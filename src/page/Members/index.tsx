import { getListUser } from '@app/libs/api/EventApi'
import { getMyUserGroups } from '@app/libs/api/userAPI'
import MemberCard from '@app/page/Members/MemberCard'
import { User, UserGroup } from '@app/server/firebaseType'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import SearchIcon from '@mui/icons-material/Search'
import { Autocomplete, Box, Container, TextField } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const Members = () => {
  const [users, setUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [userGroups, setUserGroups] = useState<UserGroup[] | undefined>([])
  const [selectedGroup, setSelectedGroup] = useState<{ label: string; value: string } | null>(null)

  useEffect(() => {
    getListUser().then((data) => {
      setAllUsers(data)
      setUsers(data)
    })
  }, [])

  useEffect(() => {
    getMyUserGroups().then((data) => {
      setUserGroups(data)
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

  const userGroupsOption = React.useMemo(() => {
    return userGroups?.map((item) => ({ label: item.groupName, value: item.groupId }))
  }, [userGroups])

  const renderList = React.useCallback(() => {
    if (!selectedGroup) return <Box className="text-center">Vui lòng chọn nhóm</Box>
    else {
      const listMember = userGroups?.find((i) => i.groupId === selectedGroup.value)?.members
      if (!listMember || !listMember?.length) return <div>Team Front-end không có ai cả!</div>
      const totalUsers = listMember.map((userId) => users.find((org) => org?.uid?.trim() === userId?.trim()))
      return totalUsers.map((user) => (
        <div className="mb-[0.625rem] rounded-3xl block" key={user?.uid}>
          <Link className="flex bg-white rounded-3xl p-3 max-w-md" to={'/profile/' + user?.uid} key={user?.uid}>
            <MemberCard user={user} />
          </Link>
        </div>
      ))
    }
  }, [selectedGroup, userGroups, users])

  return (
    <Container>
      <div className="mt-[1.875rem] mb-[1.875rem]">
        <h1 className="font-bellota text-center text-2xl">Thành viên</h1>
      </div>
      <div className="text-center mb-[1.875rem]">
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
      <Box className="mb-[1.875rem]">
        <Autocomplete
          className="max-w-md w-11/12"
          disablePortal
          id="combo-box-demo"
          options={userGroupsOption || []}
          sx={{ margin: 'auto', backgroundColor: 'white', '.MuiAutocomplete-endAdornment': { top: 'unset' } }}
          value={selectedGroup}
          renderInput={(params) => <TextField {...params} placeholder={'Lọc theo nhóm'} />}
          popupIcon={<ArrowDropDownIcon className="text-green-500 h-auto" fontSize="large" />}
          onChange={(_, item) => setSelectedGroup(item)}
        />
      </Box>
      <div className="flex flex-col content-center overflow-y-auto mx-auto w-11/12 max-w-md">{renderList()}</div>
    </Container>
  )
}

export default Members
