import { IEvent } from '@app/server/firebaseType'
import { EventDetail, EventDetailColection, UserDetail, usersColection } from '@app/server/useDB'
import { store } from '@app/stores'
import { getDoc, getDocs, limit, query, QueryDocumentSnapshot, startAt, where } from 'firebase/firestore'

export async function getListEventByUser(pageSize: number, pageIndex?: QueryDocumentSnapshot<IEvent>) {
  const queryCondition = pageIndex ? [startAt(pageIndex), limit(pageSize)] : [limit(pageSize)]
  const whereCondition = where('uid', '==', store.getState().USER.data?.uid)
  const eventDocs = await getDocs(query(EventDetailColection, ...queryCondition, whereCondition))

  // eventDocs.docs.forEach((eventDoc) => {
  //   const event = eventDoc.data()
  //   event.id = eventDoc.id
  //   console.log(eventDoc)
  // })
  return eventDocs
}

export const getUserDetail = async (uid: string) => {
  return getDoc(UserDetail(uid)).then((res) => res.data())
}

export const getListUser = async () => {
  return getDocs(usersColection).then((res) => res.docs.map((user) => user.data()))
}

export const getDetailEvent = async (id: string) => {
  const eventDocs = await getDoc(EventDetail(id))
  const EventData: IEvent = eventDocs.data()!
  EventData.id = eventDocs.id
  return EventData
}
