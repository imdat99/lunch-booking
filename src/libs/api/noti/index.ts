import { INoti } from '@app/server/firebaseType'
import { LastTimeCheckNotiColection, LastTimeCheckNotiDetail, NotiColection, NotiDetail } from '@app/server/useDB'
import dayjs from 'dayjs'
import {
  addDoc,
  doc,
  DocumentSnapshot,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  Query,
  query,
  QueryConstraint,
  QueryFieldFilterConstraint,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'

import httpClient from '../httpClient'

export const createNoti = async (data: Partial<INoti>) => {
  let isSuccess = false
  let notiId = ''
  await addDoc(NotiColection, data).then((docRef) => {
    isSuccess = true
    notiId = docRef.id
  })
  return { isSuccess, notiId }
}

export async function setUserSeen(uid: string, noti: INoti) {
  try {
    await updateDoc(NotiDetail(noti.id!), { userSeen: [...noti.userSeen, uid] })
  } catch (error) {
    console.log('ERROR SETTING USER SEEN NOTIFICATIONS IN DB', error)
  }
}

export async function IsEventNoticed(eventId: string) {
  try {
    const queryState = query(NotiColection, where('eventId', '==', eventId))
    const res = await getDocs(queryState)
    return res.docs.length > 0
  } catch (error) {
    console.log('ERROR GETTING NOTI OF EVENT IN DB', error)
  }
}
export async function IsDemandPaymentNoticed(eventId: string) {
  try {
    const queryState = query(NotiColection, where('eventId', '==', eventId), where('type', '==', 'DemandPayment'))
    const res = await getDocs(queryState)
    return res.docs.length > 0
  } catch (error) {
    console.log('ERROR GETTING NOTI OF EVENT IN DB', error)
  }
}

export async function IsPaymentNoticed(eventId: string, uid: string) {
  try {
    const queryState = query(NotiColection, where('eventId', '==', eventId), where('type', '==', 'PaymentNotice'), where('fromUid', '==', uid))
    const res = await getDocs(queryState)
    return res.docs.length > 0
  } catch (error) {
    console.log('ERROR GETTING NOTI OF EVENT IN DB', error)
  }
}

export function listenCommingNoti(uid: string, eventHandler: (noti: INoti) => void) {
  const queryState = query(NotiColection, where('toUids', 'array-contains', uid), where('date', '>', dayjs(Date.now()).unix()))
  const unsubscribe = onSnapshot(queryState, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const newNoti: INoti = { ...change.doc.data(), id: change.doc.id }
        eventHandler(newNoti)
      }
      // if (change.type === 'modified') {
      //   const newNoti: INoti = { ...change.doc.data(), id: change.doc.id }
      //   eventHandler(newNoti)
      // }
    })
  })

  return unsubscribe
}

const itemPerPage = 10

export async function getListNotiByPage(uid: string, afterSnapShot: DocumentSnapshot<INoti> | null) {
  try {
    let queryState: Query<INoti>
    if (afterSnapShot)
      queryState = query(NotiColection, where('toUids', 'array-contains', uid), orderBy('date', 'desc'), startAfter(afterSnapShot), limit(itemPerPage))
    else queryState = query(NotiColection, where('toUids', 'array-contains', uid), orderBy('date', 'desc'), limit(itemPerPage))

    const res = await getDocs(queryState)
    const listNoti: INoti[] = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    const isLastPage = res.docs.length < itemPerPage
    const lastSnapShot = res.docs.length > 0 ? res.docs[res.docs.length - 1] : null

    return {
      listNoti,
      isLastPage,
      lastSnapShot,
    }
  } catch (error) {
    console.log('ERROR GETTING NOTIFICATIONS IN DB', error)
  }
}

export const readAllNoti = async (uid: string) => {
  const queryRes = query(NotiColection, where('toUids', 'array-contains', uid))
  const res = await getDocs(queryRes)
  const listNoti: INoti[] = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  const listNotiNotRead: INoti[] = listNoti.filter((item) => !item.userSeen.includes(uid))
  listNotiNotRead.map((item) => setUserSeen(uid, item))
  // const notifyNotReadYet = allNotify
}

export const updateLastTimeCheckNoti = async (uid: string) => {
  try {
    await setDoc(
      doc(LastTimeCheckNotiColection, uid),
      {
        uid,
        checkTime: dayjs(Date.now()).unix(),
      },
      { merge: true }
    )
  } catch (error) {
    console.log('ERROR UPDATE NOTI TIME CHECKING IN DB', error)
  }
}

async function getLastTimeCheckNoti(uid: string) {
  try {
    const res = await getDoc(LastTimeCheckNotiDetail(uid))
    return res.data()?.checkTime
  } catch (error) {
    console.log('ERROR GET LAST TIME CHECK NOTI IN DB', error)
  }
}

export async function getCountNewNotice(uid: string) {
  try {
    const lastTimeCheck = await getLastTimeCheckNoti(uid)
    const queryState = query(NotiColection, where('toUids', 'array-contains', uid), where('date', '>', lastTimeCheck))
    const resCount = await getCountFromServer(queryState)
    return resCount.data().count
  } catch (error) {
    console.log('ERROR GET LAST TIME CHECK NOTI IN DB', error)
  }
}

export function sendPushNoti(toDeviceToken: string, msgBody: any) {
  httpClient.post(
    'https://fcm.googleapis.com/fcm/send',
    {
      notification: msgBody,
      to: toDeviceToken,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'key=AAAAHKakbv4:APA91bFjOlcDu--AENU-qcdgSeM3kwpZGbPS3YfT612GUpGKwu3-jhDE0bmqi_UqnVhPove6z0U60rfNUFzMzsuAbzeKZykqf9CYS-dj4gRmMNc7SaabqkeSXcF8BgDgAmQigL1DR3B5',
      },
    }
  )
}
