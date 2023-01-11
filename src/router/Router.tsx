import Layout from '@app/components/Layout'
import LayoutWithFooter from '@app/components/LayoutWithFooter'
import AppSuspense from '@app/components/Suspense'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { userStore, userStatus } from '@app/stores/user'
import { lazy, useEffect } from 'react'
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../server/firebase'
import { LoadingScreen } from '@app/components/Suspense'
import { initializeUser } from '@app/stores/user'

interface PrivateRouteProps {
  Comp: () => JSX.Element
  role?: string
}

const PrivateRoute = ({ Comp }: PrivateRouteProps) => {
  const [loggedInUser, loading] = useAuthState(auth)
  const statusUser = useAppSelector(userStatus)
  const user = useAppSelector(userStore)
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) {
      return
    } else {
      if (!loggedInUser) {
        navigate('/login', { state: window.location.pathname })
      }
    }
  }, [navigate, loading, loggedInUser])

  if (loading || statusUser === 'loading' || !user)
    return (
      <div>
        <LoadingScreen />
      </div>
    )

  return <Comp />
}

export default createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute Comp={Layout} />,
    children: [
      {
        path: '',
        element: <Navigate to="home" replace />,
      },
      {
        path: 'home',
        element: (
          <LayoutWithFooter>
            <AppSuspense comp={lazy(() => import('@app/page/Home'))} />
          </LayoutWithFooter>
        ),
      },
      {
        path: 'profile',
        element: <Outlet />,
        children: [
          {
            path: ':userUid',
            element: (
              <LayoutWithFooter>
                <AppSuspense comp={lazy(() => import('@app/page/Profile'))} />
              </LayoutWithFooter>
            ),
          },
        ],
      },
      {
        path: 'events',
        element: <Outlet />,
        children: [
          {
            path: '',
            element: (
              <LayoutWithFooter>
                <AppSuspense comp={lazy(() => import('@app/page/Events/List'))} />
              </LayoutWithFooter>
            ),
          },
          {
            path: 'add',
            element: <AppSuspense comp={lazy(() => import('@app/page/Events/Add'))} />,
          },
          {
            path: 'edit/:id',
            element: <AppSuspense comp={lazy(() => import('@app/page/Events/Add'))} />,
          },
          {
            path: ':id',
            element: <AppSuspense comp={lazy(() => import('@app/page/Events/LunchDetail'))} />,
          },
        ],
      },
      {
        path: 'members',
        element: <Outlet />,
        children: [
          {
            path: '',
            element: (
              <LayoutWithFooter>
                <AppSuspense comp={lazy(() => import('@app/page/Members'))} />
              </LayoutWithFooter>
            ),
          },
        ],
      },
      {
        path: 'notifications',
        element: (
          <LayoutWithFooter>
            <AppSuspense comp={lazy(() => import('@app/page/Notification'))} />
          </LayoutWithFooter>
        ),
      },
    ],
  },
  {
    path: 'login',
    element: <AppSuspense comp={lazy(() => import('@app/page/Login'))} />,
  },

  {
    path: '*',
    element: <AppSuspense comp={lazy(() => import('@app/page/notfound'))} />,
  },
])
