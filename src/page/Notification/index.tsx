import NotificationCard from './NotificationCard'

export default function Notification() {
  return (
    <>
      <div className="flex flex-col justify-start">
        <div className="mt-[1.875rem] mb-[1.875rem]">
          <p className="leading-[1.875rem] text-[1.5rem] text-center">Thông báo</p>
        </div>
        <div className="flex flex-col content-center">
          <div className="mb-[0.625rem]">
            <NotificationCard link="/home" time="26/12/2022" content="Bạn đã được mời ăn tại Gà Mạch Hoạch bởi Đào Thị Quỳnh Hương! " isRead={false} />
          </div>
          <div className="mb-[0.625rem]">
            {' '}
            <NotificationCard link="/home" time="26/12/2022" content="Bạn đã được mời ăn tại Gà Mạch Hoạch bởi Đào Thị Quỳnh Hương! " isRead={false} />
          </div>
          <div className="mb-[0.625rem]">
            {' '}
            <NotificationCard link="/home" time="26/12/2022" content="Bạn đã được mời ăn tại Gà Mạch Hoạch bởi Đào Thị Quỳnh Hương! " isRead={true} />
          </div>
          <div className="mb-[0.625rem]">
            {' '}
            <NotificationCard link="/home" time="26/12/2022" content="Bạn đã được mời ăn tại Gà Mạch Hoạch bởi Đào Thị Quỳnh Hương! " isRead={false} />
          </div>
        </div>
      </div>
    </>
  )
}
