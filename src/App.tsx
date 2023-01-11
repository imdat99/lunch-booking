import { LoadingScreen } from '@app/components/Suspense'
import theme from '@app/style/theme'
import { ThemeProvider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { RouterProvider } from 'react-router-dom'

import { getListEventDetail } from './libs/api/event'
import { getListUser } from './libs/api/events'
import { getNoti } from './libs/api/noti'
import Router from './router/Router'
import { auth } from './server/firebase'
import { useAppDispatch } from './stores/hook'
import { setListUser } from './stores/listUser'
import { setLisNoti } from './stores/noti'
import { initializeUser } from './stores/user'

function App() {
  const [loggedInUser, loading] = useAuthState(auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    getListUser().then((e) => {
      dispatch(setListUser(e))
    })
    getNoti((notis) => {
      dispatch(setLisNoti(notis))
    })
    if (loggedInUser) {
      dispatch(initializeUser(loggedInUser))
      getListEventDetail()
    }
  }, [dispatch, loggedInUser])

  if (loading) {
    return (
      <div>
        <LoadingScreen />
      </div>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={Router} />
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
