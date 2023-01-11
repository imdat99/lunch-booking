import { INoti } from '@app/server/firebaseType'
import { NotiColection, NotiDetail } from '@app/server/useDB'
import { store } from '@app/stores'
import { addDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
const uid = store.getState().USER.data?.uid as string
export const createNoti = async (data: Partial<INoti>) => {
  let isSuccess = false
  let notiId = ''
  await addDoc(NotiColection, data).then((docRef) => {
    isSuccess = true
    notiId = docRef.id
  })
  return { isSuccess, notiId }
}

export const getNoti = (fn: (r: INoti[]) => void) => {
  onSnapshot(query(NotiColection, where('toUids', 'array-contains', uid)), (res) => {
    fn(res.docs.map((item) => ({ ...item.data(), id: item.id, isSeen: Boolean(item.data().userSeen?.includes(uid)) })))
  })
}

export const seenNote = async (notiData: INoti) => {
  if (!notiData.userSeen.includes(uid)) {
    updateDoc(NotiDetail(notiData.id!), { userSeen: [...notiData.userSeen, uid] })
  }
}
