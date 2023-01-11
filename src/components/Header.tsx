import { auth } from '@app/server/firebase'
import { store } from '@app/stores'
import { useAppSelector } from '@app/stores/hook'
import { clearUser, userStore } from '@app/stores/user'
import { signOut } from 'firebase/auth'

const Header = () => {
  const user = useAppSelector(userStore)
  const logout = async () => {
    try {
      await signOut(auth).then(() => {
        store.dispatch(clearUser())
      })
    } catch (error) {
      console.log('ERROR LOGGING OUT', error)
    }
  }
  return (
    <header className="flex flex-wrap justify-start gap-4 items-center p-3">
      <img src={user.photoURL || ''} alt="" referrerPolicy="no-referrer" className="rounded-xl w-16" />
      <div>
        <p className="text-black">Hello, {user.name || ''}!</p>
        <button onClick={logout} className="hover:font-bold">
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
