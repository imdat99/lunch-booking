import { hadleLogout } from '@app/libs/api/userAPI'
import { useAppSelector } from '@app/stores/hook'
import { userStore } from '@app/stores/user'

const Header = () => {
  const user = useAppSelector(userStore)
  return (
    <header className="flex flex-wrap justify-start gap-4 items-center p-3">
      <img src={user.photoURL || ''} alt="" referrerPolicy="no-referrer" className="rounded-xl w-16" />
      <div>
        <p className="text-black">Hello, {user.name || ''}!</p>
        <button onClick={hadleLogout} className="hover:font-bold">
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
