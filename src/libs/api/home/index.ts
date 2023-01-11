import { EventColection, EventDetailColection } from '@app/server/useDB'
import { store } from '@app/stores'
import { CollectionReference, getDocs, query, where } from 'firebase/firestore'

const getBy = async <T = any>(cloection: CollectionReference<T>, params?: string) => {
  return (await getDocs(params ? query(cloection, where(params, '==', store.getState().USER.data?.uid)) : cloection)).docs.map((item) => ({
    ...item.data(),
    id: item.id,
  }))
}
export const getHomeData = async () => {
  const uid = store.getState().USER.data?.uid
  console.log('uid', uid)

  //list bữa ăn user chủ chi
  const allEvent = await getBy(EventColection)
  const isHost = allEvent.filter((item) => item.userPayId === uid)

  // số bữa ăn user tham gia
  const allEventDefail = await getBy(EventDetailColection)
  const isMember = allEventDefail.filter((item) => item.uid === uid)

  // list bữa ăn user chưa trả
  const unPaidList = isMember
    .filter((item) => !item.isPaid)
    .map((item) => ({ ...item, eventName: allEvent.find((event) => event.id === item.eventId)?.eventName }))
  console.log('unPaidList', unPaidList)
  // list bữa ăn user chưa đòi
  const requirePaymentList = isHost
    .filter((item) => !item.isAllPaid)
    .map((item) => {
      const paid = allEventDefail.filter((event) => event.eventId === item.id && event.isPaid).reduce((sum, event) => sum + Number(event.amount!), 0)
      return {
        ...item,
        totalAmount: item.totalAmount! - paid,
      }
    })
  console.log('requirePaymentList', requirePaymentList)

  const isMemberCount = isMember.length - isHost.length

  return {
    isHostCount: isHost.length,
    isMemberCount: isMemberCount > 0 ? isMemberCount : 0,
    unPaidList,
    requirePaymentList,
  }
}
