import { getListUser } from '@app/libs/api/EventApi'
import { getMyUserGroups } from '@app/libs/api/userAPI'
import MemberCard from '@app/page/Members/MemberCard'
import { User, UserGroup } from '@app/server/firebaseType'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import SearchIcon from '@mui/icons-material/Search'
import { Autocomplete, Box, Container, TextField } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Members = () => {
  const [searchText, setSearchText] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [userGroups, setUserGroups] = useState<UserGroup[] | undefined>([])
  const [selectedGroup, setSelectedGroup] = useState<{ label: string; value: string } | null>(null)

  const { search } = useLocation()
  const searchMap = useRef(new URLSearchParams(search))
  const initialMemberQuery = searchMap.current.get('search')
  const initialGroupId = searchMap.current.get('group')

  useEffect(() => {
    if (initialMemberQuery) {
      setSearchText(initialMemberQuery)
    }
  }, [initialMemberQuery])

  useEffect(() => {
    if (initialGroupId === null || !userGroups || !userGroups.length) {
      return
    }

    const matchedGroup = userGroups.find((g) => g.groupId === initialGroupId)

    if (matchedGroup) {
      setSelectedGroup({ label: matchedGroup.groupName, value: matchedGroup.groupId })
    }
  }, [userGroups, initialGroupId])

  useEffect(() => {
    getListUser().then((data) => {
      setUsers(data)
    })
  }, [])

  useEffect(() => {
    getMyUserGroups().then((data) => {
      setUserGroups(data)
    })
  }, [])

  const onChangeSearch = (event: any) => {
    setSearchText(event.target.value)
  }

  const userGroupsOption = React.useMemo(() => {
    return userGroups?.map((item) => ({ label: item.groupName, value: item.groupId }))
  }, [userGroups])

  const renderList = React.useCallback(() => {
    if (!selectedGroup) return <Box className="text-center">Vui lòng chọn nhóm</Box>
    else {
      const listMember = userGroups?.find((i) => i.groupId === selectedGroup.value)?.members
      if (!listMember || !listMember?.length) return <div>Nhóm không có ai cả!</div>
      const usersData = listMember.map((userId) => users.find((org) => org?.uid?.trim() === userId?.trim()))
      const totalUsers = searchText ? usersData.filter((item) => item?.name?.toLowerCase()?.includes(searchText.toLowerCase())) : usersData
      return totalUsers.length
        ? totalUsers.map((user, index) => (
            <div className="mb-[0.625rem] rounded-3xl block" key={index}>
              <Link className="flex bg-white rounded-3xl p-3 max-w-md" to={'/profile/' + user?.uid} key={user?.uid}>
                <MemberCard user={user} />
              </Link>
            </div>
          ))
        : null
    }
  }, [searchText, selectedGroup, userGroups, users])

  return (
    <Container>
      <div className="mt-[1.875rem] mb-[1.875rem]">
        <h1 className="font-bellota text-center text-2xl">Thành viên</h1>
      </div>
      <div className="text-center mb-[1.875rem]">
        <OutlinedInput
          className="max-w-md w-11/12"
          sx={{ height: '46px', borderRadius: '30px', backgroundColor: 'white' }}
          id="outlined-adornment-password"
          type={'text'}
          placeholder={'Tìm kiếm'}
          endAdornment={
            <InputAdornment position="end">
              <SearchIcon fontSize={'large'} />
            </InputAdornment>
          }
          onChange={onChangeSearch}
          value={searchText}
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
          isOptionEqualToValue={(v1, v2) => v1.value === v2.value}
        />
      </Box>
      <div className="flex flex-col content-center overflow-y-auto mx-auto w-11/12 max-w-md">{renderList()}</div>
    </Container>
  )
}

export default Members
