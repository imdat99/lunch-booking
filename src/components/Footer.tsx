import { PAGES, PAGE_ROUTES } from '@app/contants'
import { currentPageStore, setCurrentPage } from '@app/stores/footer'
import { useAppDispatch } from '@app/stores/hook'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import HomeIcon from '@mui/icons-material/Home'
import ListAltIcon from '@mui/icons-material/ListAlt'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PeopleIcon from '@mui/icons-material/People'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Footer = () => {
  const dispatch = useAppDispatch()

  const navigateTo = useNavigate()
  const currentPage = useSelector(currentPageStore)

  const onClickFooterIcon = (page: string) => {
    dispatch(setCurrentPage(page))
    navigateTo(PAGE_ROUTES[page])
  }

  return (
    <div className="fixed bottom-0 w-full text-center h-[60px] flex justify-around" style={{ backgroundColor: '#D9D9D9' }}>
      <button className="flex-1" onClick={() => onClickFooterIcon(PAGES.HOME)}>
        <div>
          <HomeIcon sx={{ color: currentPage === PAGES.HOME ? '#439D0D' : '#A0A0A0' }} />
        </div>
        <div className={`text-[12px] ${currentPage === PAGES.HOME ? 'text-dark-green-1' : 'text-grey-1'}`}>Home</div>
      </button>
      <button className="flex-1" onClick={() => onClickFooterIcon(PAGES.HISTORY)}>
        <div>
          <ListAltIcon sx={{ color: currentPage === PAGES.HISTORY ? '#439D0D' : '#A0A0A0' }} />
        </div>
        <div className={`text-[12px] ${currentPage === PAGES.HISTORY ? 'text-dark-green-1' : 'text-grey-1'}`}>History</div>
      </button>
      <button className="flex flex-col items-center flex-1" onClick={() => onClickFooterIcon(PAGES.ADD_BILL)}>
        <div className="flex text-center items-center mt-[-24px] rounded-[50%] bg-grey-2 w-[55px] h-[55px] justify-center">
          <AddCircleIcon sx={{ width: '45px', height: '45px', justifyContent: 'center', color: currentPage === PAGES.ADD_BILL ? '#439D0D' : '#B91D37' }} />
        </div>
        <div className={`text-[12px] mt-[-6px] ${currentPage === PAGES.ADD_BILL ? 'text-dark-green-1' : 'text-grey-1'}`}>Add Bill</div>
      </button>
      <button className="flex-1" onClick={() => onClickFooterIcon(PAGES.NOTIFICATIONS)}>
        <div>
          <NotificationsIcon sx={{ color: currentPage === PAGES.NOTIFICATIONS ? '#439D0D' : '#A0A0A0' }} />
        </div>
        <div className={`text-[12px] ${currentPage === PAGES.NOTIFICATIONS ? 'text-dark-green-1' : 'text-grey-1'}`}>Notifications</div>
      </button>
      <button className="flex-1" onClick={() => onClickFooterIcon(PAGES.MEMBERS)}>
        <div>
          <PeopleIcon sx={{ color: currentPage === PAGES.MEMBERS ? '#439D0D' : '#A0A0A0' }} />
        </div>
        <div className={`text-[12px] mt-[-6px] ${currentPage === PAGES.MEMBERS ? 'text-dark-green-1' : 'text-grey-1'}`}>Members</div>
      </button>
    </div>
  )
}

export default Footer
