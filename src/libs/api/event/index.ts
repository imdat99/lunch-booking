import { IEvent, IEventDetail, User } from '@app/server/firebaseType'
import { EventColection, EventDetailColection, EventRef, UserDetail } from '@app/server/useDB'
import { store } from '@app/stores'
import { setListEventDetail } from '@app/stores/listEventDetail'
import { deleteDoc, getDocs, limit, onSnapshot, Query, query, updateDoc, where } from 'firebase/firestore'
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

export const getListEventDetail = async (uid: string) => {
  const queryState: Query<IEventDetail> = query(EventDetailColection, where('uid', '==', uid))
  onSnapshot(queryState, (res) => {
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

export async function getEventByPage(uid: string, eventDetailList: IEventDetail[], startPosition: number | 0) {
  try {
    const queryState2: Query<IEventDetail> = query(EventDetailColection, where('uid', '==', uid))
    const res2 = await getDocs(queryState2)
    const ListEventDetail = res2.docs.map((item) => item.data().eventId || '')
    const lastPosion = startPosition + itemPerPage - 1
    const listEventOfset: string[] = ListEventDetail.slice(startPosition, lastPosion)
    const queryState: Query<IEvent> = query(EventColection, where('__name__', 'in', listEventOfset))
    const res = await getDocs(queryState)
    const eventList: IEvent[] = res.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    const isLastPage = listEventOfset.length < itemPerPage - 1
    startPosition = lastPosion + 1
    return {
      eventList,
      isLastPage,
      startPosition,
    }
  } catch (error) {
    console.log('ERROR GETTING EVENT IN DB', error)
  }
}
