import { INoti } from '@app/server/firebaseType'
import { NotiColection, NotiDetail } from '@app/server/useDB'
import { store } from '@app/stores'
import { addDoc, onSnapshot, query, updateDoc, where , startAfter , orderBy , limit , Query , getDocs , DocumentSnapshot, serverTimestamp} from 'firebase/firestore'
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
