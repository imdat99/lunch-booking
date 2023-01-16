import { INoti } from '@app/server/firebaseType'
import { NotiColection, NotiDetail , LastTimeCheckNotiColection , LastTimeCheckNotiDetail} from '@app/server/useDB'
import { store } from '@app/stores'
import { addDoc, onSnapshot, query, updateDoc, where , startAfter , orderBy , limit , Query , getDoc , getDocs , DocumentSnapshot, getCountFromServer ,setDoc ,doc} from 'firebase/firestore'
import dayjs from 'dayjs'

export const createNoti = async (data: Partial<INoti>) => {
  let isSuccess = false
  let notiId = ''
  await addDoc(NotiColection, data).then((docRef) => {
    isSuccess = true
    notiId = docRef.id
  })
  return { isSuccess, notiId }
}

export async function setUserSeen(uid:string,noti:INoti) {
  try {
      await updateDoc(NotiDetail(noti.id!), { userSeen: [...noti.userSeen, uid] })
  } catch (error) {
    console.log('ERROR SETTING USER SEEN NOTIFICATIONS IN DB', error)
  }
}

export async function IsEventNoticed(eventId:string){
  try {
    var queryState = query(NotiColection, where('eventId', '==', eventId))
    const res = await getDocs(queryState)
    return res.docs.length > 0
  } catch (error) {
    console.log('ERROR GETTING NOTI OF EVENT IN DB', error)
  }
}
export async function IsDemandPaymentNoticed(eventId:string){
  try {
    var queryState = query(NotiColection, where('eventId', '==', eventId),where('type','==',"DemandPayment"))
    const res = await getDocs(queryState)
    return res.docs.length > 0
  } catch (error) {
    console.log('ERROR GETTING NOTI OF EVENT IN DB', error)
  }
}

export async function IsPaymentNoticed(eventId:string,uid:string){
  try {
    var queryState = query(NotiColection, where('eventId', '==', eventId),where('type','==',"PaymentNotice"),where('fromUid','==',uid))
    const res = await getDocs(queryState)
    return res.docs.length > 0
  } catch (error) {
    console.log('ERROR GETTING NOTI OF EVENT IN DB', error)
  }
}



export function listenCommingNoti(uid:string,eventHandler:(noti : INoti)=>void){
  var queryState = query(NotiColection, where('toUids', 'array-contains', uid),where('date','>',dayjs(Date.now()).unix()))
  const unsubscribe  = onSnapshot(queryState,(snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const newNoti : INoti = {...change.doc.data(),id:change.doc.id}
        eventHandler(newNoti)
      }
    })})

    return unsubscribe ;
}

const itemPerPage = 10

export async function getListNotiByPage(uid: string,afterSnapShot : DocumentSnapshot<INoti> | null) {
  try {
    var queryState : Query<INoti>
    if(afterSnapShot)
      queryState = query(NotiColection, where('toUids', 'array-contains', uid), orderBy("date","desc"),startAfter(afterSnapShot),limit(itemPerPage));
    else
      queryState = query(NotiColection, where('toUids', 'array-contains', uid), orderBy("date","desc"),limit(itemPerPage));

    const res = await getDocs(queryState)
    const listNoti : INoti[] = res.docs.map((doc) => ({ ...doc.data(), id: doc.id}))
    const isLastPage = res.docs.length < itemPerPage
    const lastSnapShot = res.docs.length > 0 ? res.docs[res.docs.length-1] : null
    
    return {
      listNoti,
      isLastPage,
      lastSnapShot
    }
  } catch (error) {
    console.log('ERROR GETTING NOTIFICATIONS IN DB', error)
  }
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
    console.log('ERROR UPDATE NOTI TIME CHECKING IN DB',error)
  }
}

async function getLastTimeCheckNoti(uid: string){
  try {
    const res = await getDoc(LastTimeCheckNotiDetail(uid))
    return res.data()?.checkTime
  } catch (error) {
    console.log('ERROR GET LAST TIME CHECK NOTI IN DB',error)
  }
}


export async function getCountNewNotice(uid: string){
  try {
    const lastTimeCheck = await getLastTimeCheckNoti(uid)
    const queryState = query(NotiColection, where('toUids', 'array-contains', uid),where('date','>',lastTimeCheck))
    const resCount = await getCountFromServer(queryState)
    return resCount.data().count
  } catch (error) {
    console.log('ERROR GET LAST TIME CHECK NOTI IN DB',error)
  }
}

