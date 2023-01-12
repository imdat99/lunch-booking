import theme from '@app/style/theme'
import { ThemeProvider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { RouterProvider } from 'react-router-dom'

import { getListEventDetail } from './libs/api/event'
import { getListUser } from './libs/api/events'
import Router from './router/Router'
import { auth } from './server/firebase'
import { useAppDispatch } from './stores/hook'
import { setListUser } from './stores/listUser'
import { initializeUser } from './stores/user'
import { listenCommingNoti } from './libs/api/noti'
import { addNewNotiCome } from './stores/noti'

function App() {
  const [loggedInUser, loading] = useAuthState(auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    getListUser().then((e) => {
      dispatch(setListUser(e))
    })

    if (loggedInUser) {
      const {uid} = loggedInUser
      dispatch(initializeUser(loggedInUser))
      var unscribe = listenCommingNoti(uid,(noti)=>{
          dispatch(addNewNotiCome(noti))
      })
      getListEventDetail()
    }
  }, [dispatch, loggedInUser])


  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={Router} />
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
