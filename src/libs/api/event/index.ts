import { User } from '@app/server/firebaseType'
import { EventColection, EventDetailColection, UserDetail } from '@app/server/useDB'
import { store } from '@app/stores'
import { setListEvent } from '@app/stores/listEvent'
import { setListEventDetail } from '@app/stores/listEventDetail'
import { onSnapshot, query, updateDoc } from 'firebase/firestore'

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
