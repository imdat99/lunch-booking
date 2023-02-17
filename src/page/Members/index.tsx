import { getListUser } from '@app/libs/api/EventApi'
import { getMyUserGroups } from '@app/libs/api/userAPI'
import MemberCard from '@app/page/Members/MemberCard'
import { User, UserGroup } from '@app/server/firebaseType'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import SearchIcon from '@mui/icons-material/Search'
import { Autocomplete, Box, CircularProgress, Container, TextField } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import OutlinedInput from '@mui/material/OutlinedInput'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Link, useLocation } from 'react-router-dom'

const Members = () => {
  const [searchText, setSearchText] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [userGroups, setUserGroups] = useState<UserGroup[] | undefined>([])
  const [selectedGroup, setSelectedGroup] = useState<{ label: string; value: string } | null>(null)
  const [listMember, setListMember] = useState<string[]>([])
  const pageSize = 10
  const [page, setPage] = useState<number>(1)
  const [totalPage, setTotalPage] = useState<number>(1)

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
      const defaultSelected = { label: data?.[0]?.groupName, value: data?.[0]?.groupId }
      if (defaultSelected) {
        setSelectedGroup(defaultSelected)
      } else setSelectedGroup(null)
      setUserGroups(data)
    })
  }, [])

  useEffect(() => {
    if (selectedGroup) {
      const newList = userGroups?.find((i) => i.groupId === selectedGroup.value)?.members.slice(0, 8)
      const totalPage = Math.floor((userGroups?.find((i) => i.groupId === selectedGroup.value)?.members?.length || 0) / pageSize) + 1
      setTotalPage(totalPage)
      setPage(1)
      if (newList?.length) {
        setListMember(newList)
      } else setListMember([])
    }
  }, [selectedGroup, userGroups])

  const onChangeSearch = (event: any) => {
    setSearchText(event.target.value)
  }

  const userGroupsOption = React.useMemo(() => {
    return userGroups?.map((item) => ({ label: item.groupName, value: item.groupId }))
  }, [userGroups])

  const handleLoadMore = useCallback(() => {
    if (page === totalPage) return
    if (selectedGroup) {
      const handler = setTimeout(() => {
        const newList = userGroups?.find((i) => i.groupId === selectedGroup?.value)?.members.slice(0, (page + 1) * pageSize)
        if (newList?.length && page < totalPage) {
          setPage((prev) => prev + 1)
          setListMember(newList)
        }
      }, 1500)
      return () => clearTimeout(handler)
    }
  }, [page, selectedGroup, totalPage, userGroups])

  const renderList = React.useCallback(() => {
    if (!selectedGroup) return <Box className="text-center text-[13px]">Vui lòng chọn nhóm</Box>
    else {
      if (!listMember || !listMember?.length) return <Box className="text-center text-[13px]">Nhóm không có ai cả!</Box>
      const usersData = listMember.map((userId) => users.find((org) => org?.uid?.trim() === userId?.trim()))
      const totalUsers = searchText ? usersData.filter((item) => item?.name?.toLowerCase()?.includes(searchText.toLowerCase())) : usersData
      return totalUsers.length
        ? totalUsers.map((user, index) => (
            <div className="mb-[0.625rem] rounded-md block border-[1px] bg-white drop-shadow-lg" key={index}>
              <Link className="flex rounded-md p-3 max-w-md" to={'/profile/' + user?.uid} key={user?.uid}>
                <MemberCard user={user} />
              </Link>
            </div>
          ))
        : null
    }
  }, [listMember, searchText, selectedGroup, users])

  return (
    <Container
      className="relative"
      sx={{
        paddingRight: 0,
        paddingLeft: 0,
        margin: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '375px',
      }}
    >
      <Box className="sticky top-0 mb-3 z-10 bg-white border-b-[1px] rounded-b-xl drop-shadow-lg max-w-[800px] min-w-[375px]">
        <Box className="py-4">
          <Box className="font-bellota text-center text-[18px] font-bold">Thành viên</Box>
        </Box>
        <Box className="px-4 pb-4">
          <OutlinedInput
            className="w-full mb-2"
            sx={{ height: '40px', backgroundColor: 'white' }}
            id="outlined-adornment-password"
            type={'text'}
            placeholder={'Tìm kiếm'}
            autoComplete="off"
            endAdornment={
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            }
            onChange={onChangeSearch}
            value={searchText}
          />
          <Autocomplete
            className="w-full text-[14px] mb-2"
            disablePortal
            id="combo-box-demo"
            options={userGroupsOption || []}
            sx={{
              height: '40px',
              margin: 'auto',
              backgroundColor: 'white',
              '.MuiAutocomplete-endAdornment': { top: 'unset' },
              '.MuiOutlinedInput-root': { padding: 'unset' },
            }}
            value={selectedGroup}
            renderInput={(params) => <TextField {...params} placeholder={'Lọc theo nhóm'} />}
            popupIcon={<ArrowDropDownIcon className="text-green-500 h-auto" />}
            onChange={(_, item) => setSelectedGroup(item)}
            isOptionEqualToValue={(v1, v2) => v1.value === v2.value}
          />
        </Box>
      </Box>
      <Box className="min-w-[375px]">
        <InfiniteScroll
          hasMore={page < totalPage}
          next={handleLoadMore}
          loader={
            <Box className="flex items-center justify-center py-5">
              <CircularProgress />
            </Box>
          }
          dataLength={listMember.length}
        >
          {renderList()}
        </InfiniteScroll>
      </Box>
    </Container>
  )
}

export default Members
