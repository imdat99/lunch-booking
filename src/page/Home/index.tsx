import { getHomeData } from '@app/libs/api/home'
import { IEvent, IEventDetail } from '@app/server/firebaseType'
import { useAppDispatch, useAppSelector } from '@app/stores/hook'
import { userStore } from '@app/stores/user'
import { Grid } from '@mui/material'
import { Container } from '@mui/system'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const user = useAppSelector(userStore)
  const dispatch = useAppDispatch()

  useEffect(() => {
    getHomeData().then((e) => {
      setListEvent(e)
    })
  }, [dispatch])

  const [listEvent, setListEvent] = useState<any>()

  const css = `
    html {
      width: 100vw;
      height: 100vh;
    }
    #header, #dashboard, #list {
      font-family: 'Bellota';
      font-style: normal;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    #hello {
      font-family: 'Bellota';
      font-style: normal;
      font-weight: 700;
      font-size: 18px;
      line-height: 23px;
      /* identical to box height */

      color: #000000;
    }
    #username {
      font-family: 'Bellota';
      font-style: normal;
      font-weight: 700;
      font-size: 24px;
      line-height: 30px;

      color: #000000;
    }
    #userImg {
      width: 64px;
      height: auto;
      border-radius: 32px;
      float: right;

      filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    }
    .box {
      background: #FFFFFF;
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
      border-radius: 10px;
      height: 100%;
    }
    .item {
      margin: 10px;
      padding: 20px;
    }
    .itemHeader {
      font-weight: 700;
      font-size: 16px;
      line-height: 20px;
      margin-bottom: 20px;
    }
    .itemDetail {
      float: right;
      font-weight: 700;
      font-size: 24px;
      line-height: 30px;
    }
    .divider {
      border: 1px solid #9C9C9C;
      margin-top: 10px;
      margin-bottom: 10px;
    }
    .text-right {
      float: right;
    }
    .text-bold {
      font-weight: 700;
    }
    .text-link {
      text-decoration-line: underline;
      color: #0075FF;
    }
  `

  const getTotalUnPaidAmount = () => {
    // let result = 0;
    const result = listEvent.unPaidList.reduce((total: number, data: IEventDetail) => (total += data.amountToPay || 0), 0)
    return Math.round(result)
  }

  const getTotalRequirePayment = () => {
    // let result = 0;
    const result = listEvent.requirePaymentList.reduce((total: number, data: IEvent) => (total += data.totalAmount || 0), 0)
    return Math.round(result)
  }

  return listEvent ? (
    <Container>
      <style>{css}</style>
      <Grid id="header" container direction="row" alignItems="center">
        <Grid item xs={10}>
          <p id="hello">Xin chào</p>
          <p id="username">{user?.name}</p>
        </Grid>
        <Grid item xs={2}>
          <Link to={'/profile/' + user.uid}>
            <img id="userImg" src={user?.photoURL || ''} alt="user_photo" referrerPolicy="no-referrer" />
          </Link>
        </Grid>
      </Grid>
      <Grid id="dashboard" container direction="row" alignItems="center" justifyContent="center" spacing={3} sx={{ marginLeft: { xs: '-12px', sm: '0' } }}>
        <Grid className="item box" item xs={6} sm={3} sx={{ maxWidth: { xs: '43vw', sm: '20vw', lg: '14vw' } }}>
          <p className="itemHeader">Tham gia</p>
          <p className="itemDetail">{listEvent.isMemberCount} lần</p>
        </Grid>
        <Grid className="item box" item xs={6} sm={3} sx={{ maxWidth: { xs: '43vw', sm: '20vw', lg: '14vw' } }}>
          <p className="itemHeader">Chủ chi</p>
          <p className="itemDetail">{listEvent.isHostCount} lần</p>
        </Grid>
        <Grid className="item box" item sm={3} sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: { sm: '20vw', lg: '14vw' } }}>
          <p className="itemHeader">Cần trả</p>
          <p className="itemDetail">{getTotalUnPaidAmount()} (K)</p>
        </Grid>
        <Grid className="item box" item sm={3} sx={{ display: { xs: 'none', sm: 'block' }, maxWidth: { sm: '20vw', lg: '14vw' } }}>
          <p className="itemHeader">Cần đòi</p>
          <p className="itemDetail">{getTotalRequirePayment()} (K)</p>
        </Grid>
      </Grid>
      <Grid id="list" container direction="row" justifyContent="center" spacing={3} sx={{ marginLeft: { xs: '-12px', sm: '0' } }}>
        <Grid className="item box" item xs={12} sm={6} sx={{ maxWidth: { sm: '43vw', lg: '29vw' } }}>
          <div>
            <span className="text-bold">Số bữa chưa trả</span>
            <span className="text-right">{listEvent.unPaidList.length} bữa</span>
          </div>
          <hr className="divider" />
          {listEvent.unPaidList.length > 0 ? (
            listEvent.unPaidList.map((data: any) => (
              <div key={data.id}>
                <Link to={'/events/' + data.eventId} className="text-link">
                  {data.eventName}
                </Link>
                <span className="text-right">{data.amountToPay}K VND</span>
              </div>
            ))
          ) : (
            <img src="/paid.png" alt="paid" />
          )}
          <hr className="divider" />
          <div>
            <span className="text-bold">Tổng</span>
            <span className="text-right">{getTotalUnPaidAmount()}K VND</span>
          </div>
        </Grid>
        <Grid className="item box" item xs={12} sm={6} sx={{ maxWidth: { sm: '43vw', lg: '29vw' } }}>
          <div>
            <span className="text-bold">Số bữa chưa đòi</span>
            <span className="text-right">{listEvent.requirePaymentList.length} bữa</span>
          </div>
          <hr className="divider" />
          {listEvent.requirePaymentList.length > 0 ? (
            listEvent.requirePaymentList.map((data: any) => (
              <div key={data.id}>
                <Link to={'/events/' + data.id} className="text-link">
                  {data.eventName}
                </Link>
                <span className="text-right">{Math.round(data.totalAmount)}K VND</span>
              </div>
            ))
          ) : (
            <img src="/paid.png" alt="paid" />
          )}
          <hr className="divider" />
          <div>
            <span className="text-bold">Tổng</span>
            <span className="text-right">{getTotalRequirePayment()}K VND</span>
          </div>
        </Grid>
      </Grid>
      <div></div>
    </Container>
  ) : (
    <></>
  )
}
