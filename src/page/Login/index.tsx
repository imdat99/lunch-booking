import { auth } from '@app/server/firebase'
import { useAppSelector } from '@app/stores/hook'
import { userStore } from '@app/stores/user'
import GoogleIcon from '@mui/icons-material/Google'
import { useEffect } from 'react'
import { useSignInWithGoogle } from 'react-firebase-hooks/auth'
import { useLocation, useNavigate } from 'react-router-dom'

const Login = () => {
  const [signInWithGoogle, _user, loading] = useSignInWithGoogle(auth)

  const navigate = useNavigate()
  const user = useAppSelector(userStore)
  const location = useLocation()
  const signIn = () => {
    signInWithGoogle()
  }
  useEffect(() => {
    if (user?.uid) {
      navigate(location.state || '/')
    }
  }, [user, navigate, location])
  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-light-green-1 to-dark-green-1 h-screen">
        <div className="w-full max-w-xs space-y-8">
          <div className="flex items-center justify-center">
            <img src="/login-logo.png" alt="Your Company" className="h-56 w-56" />
          </div>
          <div className="text-center">
            <span className="text-white text-4xl font-bellota">Happy Lunch</span>
          </div>
          <div>
            <button
              className="focus:outline-none focus:ring-offset-1 focus:ring-gray-700 py-3.5 px-4 rounded-full w-full mt-10 bg-white text-dard-green-1"
              onClick={signIn}
              disabled={loading}
            >
              <span className="text-xl flex items-center justify-center gap-4">
                <GoogleIcon fontSize={'large'} />
                Sign in with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
