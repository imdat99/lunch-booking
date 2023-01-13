import { User } from '@app/server/firebaseType'
import { EventColection, EventDetailColection, EventRef, UserDetail } from '@app/server/useDB'
import { store } from '@app/stores'
import { setListEvent } from '@app/stores/listEvent'
import { setListEventDetail } from '@app/stores/listEventDetail'
import { deleteDoc, documentId, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore'

// export const getListEvent = (fn: (d: IEvent[]) => void) => {
//   onSnapshot(query(EventColection), (res) => {
//     fn(res.docs.map((item) => ({ ...item.data(), id: item.id })))
//   })
// }
export const updateUserInfo = (uid: string, data: User) => {
  updateDoc(UserDetail(uid), data)
}

const getListEvent = () => {
  const q = query(EventColection)
  onSnapshot(q, (res) => {
    store.dispatch(
      setListEvent(
        res.docs.map((item) => {
          return {
            ...item.data(),
            id: item.id,
          }
        })
      )
    )
  })
}

export const getListEventDetail = () => {
  const q = query(EventDetailColection)
  onSnapshot(q, (res) => {
    const ListEventDetail = res.docs.map((item) => ({ ...item.data(), id: item.id }))
    getListEvent()
    store.dispatch(setListEventDetail(ListEventDetail))
  })
}

export const deleteEvent = async (id: string) => {
  const q = query(EventDetailColection, where('eventId', '==', id))
  return getDocs(q)
    .then((doc) => {
      doc.forEach(async (event) => {
        await deleteDoc(event.ref)
      })
    })
    .then(async () => {
      await deleteDoc(EventRef(id))
    })
    .then(() => true)
    .catch(() => false)
}
