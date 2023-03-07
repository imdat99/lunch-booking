import theme from '@app/style/theme'
import { ThemeProvider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { getToken, onMessage } from 'firebase/messaging'
import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { RouterProvider } from 'react-router-dom'

import { getListEventDetail } from './libs/api/event'
import { getListUser } from './libs/api/events'
import { listenCommingNoti } from './libs/api/noti'
import { setUserField } from './libs/api/userAPI'
import Router from './router/Router'
import { auth, messaging } from './server/firebase'
import { useAppDispatch } from './stores/hook'
import { setListUser } from './stores/listUser'
import { addNewNotiCome, initializeNotiList, updateNewNotiCount } from './stores/noti'
import { initializeUser } from './stores/user'

function App() {
  const { VITE_APP_vapiKey: vapiKey } = import.meta.env
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loggedInUser, loading] = useAuthState(auth)
  const dispatch = useAppDispatch()

  useEffect(() => {
    getListUser().then((e) => {
      dispatch(setListUser(e))
    })
    if (loggedInUser) {
      // getAllowedEmail(loggedInUser?.email || '').then((isAllowed) => {
      //   if (isAllowed) {
      //     const { uid } = loggedInUser!
      //     dispatch(initializeUser(loggedInUser!))
      //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
      //     const _unscribe = listenCommingNoti(uid, (noti) => {
      //       dispatch(addNewNotiCome(noti))
      //     })
      //     getListEventDetail()
      //   } else {
      //     hadleLogout()
      //   }
      // })
      const { uid } = loggedInUser
      dispatch(initializeUser(loggedInUser))
      dispatch(initializeNotiList(uid))
      const _unscribe = listenCommingNoti(uid, (noti) => {
        dispatch(addNewNotiCome(noti))
        dispatch(updateNewNotiCount(uid))
      })
      getListEventDetail()
      getToken(messaging, { vapidKey: vapiKey }).then((currentToken) => {
        if (currentToken) {
          setUserField(uid, 'receiveToken', currentToken)
        } else {
          console.log('cannot get token')
        }
      })
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload)
        // ...
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
