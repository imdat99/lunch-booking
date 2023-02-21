import { IEvent, User } from '@app/server/firebaseType'
import { EventColection, EventDetailColection, EventRef, UserDetail } from '@app/server/useDB'
import { store } from '@app/stores'
import { setListEvent } from '@app/stores/listEvent'
import { setListEventDetail } from '@app/stores/listEventDetail'
import { deleteDoc, DocumentSnapshot, getDocs, limit, onSnapshot, orderBy, Query, query, startAfter, updateDoc, where } from 'firebase/firestore'

// export const getListEvent = (fn: (d: IEvent[]) => void) => {
//   onSnapshot(query(EventColection), (res) => {
//     fn(res.docs.map((item) => ({ ...item.data(), id: item.id })))
//   })
// }
export const updateUserInfo = (uid: string, data: User) => {
  updateDoc(UserDetail(uid), data)
}

// const getListEvent = () => {
//   const q = query(EventColection)
//   onSnapshot(q, (res) => {
//     store.dispatch(
//       setListEvent(
//         res.docs.map((item) => {
//           return {
//             ...item.data(),
//             id: item.id,
//           }
//         })
//       )
//     )
//   })
// }

export const getListEventDetail = () => {
  const q = query(EventDetailColection)
  onSnapshot(q, (res) => {
    const ListEventDetail = res.docs.map((item) => ({ ...item.data(), id: item.id }))
    // getListEvent()
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

const itemPerPage = 10

export async function getEventByPage(afterSnapShot: DocumentSnapshot<IEvent> | null) {
  try {
    let queryState: Query<IEvent>
    if (afterSnapShot) queryState = query(EventColection, orderBy('date', 'desc'), startAfter(afterSnapShot), limit(itemPerPage))
    else queryState = query(EventColection, orderBy('date', 'desc'), limit(itemPerPage))

    const res = await getDocs(queryState)
    const eventList: IEvent[] = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    const isLastPage = res.docs.length < itemPerPage
    const lastSnapShot = res.docs.length > 0 ? res.docs[res.docs.length - 1] : null

    return {
      eventList,
      isLastPage,
      lastSnapShot,
    }
  } catch (error) {
    console.log('ERROR GETTING NOTIFICATIONS IN DB', error)
  }
}
