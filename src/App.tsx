import theme from '@app/style/theme'
import { ThemeProvider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { RouterProvider } from 'react-router-dom'

import { getListEventDetail } from './libs/api/event'
import { getListUser } from './libs/api/events'
import { listenCommingNoti } from './libs/api/noti'
import { getAllowedEmail, hadleLogout } from './libs/api/userAPI'
import Router from './router/Router'
import { auth } from './server/firebase'
import { useAppDispatch } from './stores/hook'
import { setListUser } from './stores/listUser'
import { addNewNotiCome } from './stores/noti'
import { initializeUser } from './stores/user'
function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loggedInUser, loading] = useAuthState(auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    getListUser().then((e) => {
      dispatch(setListUser(e))
    })
    if (loggedInUser) {
      getAllowedEmail(loggedInUser?.email || '').then((isAllowed) => {
        if (isAllowed) {
          const { uid } = loggedInUser!
          dispatch(initializeUser(loggedInUser!))
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _unscribe = listenCommingNoti(uid, (noti) => {
            dispatch(addNewNotiCome(noti))
          })
          getListEventDetail()
        } else {
          hadleLogout()
        }
      })
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
