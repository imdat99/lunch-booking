import { IEvent, IEventDetail, User } from '@app/server/firebaseType'
import { EventColection, EventDetail, EventDetailColection, EventRef, UserDetail, usersColection } from '@app/server/useDB'
import { addDoc, getDocs, updateDoc } from 'firebase/firestore'

export const getListUser = async () => {
  const userDocs = await getDocs(usersColection)
  const listUser: User[] = []
  userDocs.docs.forEach((userDoc) => {
    const user = userDoc.data()
    listUser.push(user)
  })
  return listUser
}
export const setEvent = async (data: IEvent) => {
  let isSuccess = false
  let eventId = ''
  await addDoc(EventColection, data).then((docRef) => {
    isSuccess = true
    eventId = docRef.id
  })
  return { isSuccess, eventId }
}
export const setEventDetail = async (data: IEventDetail) => {
  let isSuccess = false
  let eventId = ''
  await addDoc(EventDetailColection, data).then((docRef) => {
    isSuccess = true
    eventId = docRef.id
  })
  return { isSuccess, eventId }
}

export const updateEventDetail = async (eventId: string, data: IEvent) => {
  let isSuccess = false
  await updateDoc(EventDetail(eventId), data).then(() => {
    isSuccess = true
  })
  return { isSuccess, eventId }
}
export const updateEvent = async (eventId: string, data: IEvent) => {
  let isSuccess = false
  await updateDoc(EventRef(eventId), data).then(() => {
    isSuccess = true
  })
  return { isSuccess, eventId }
}
export const updateMemberInfo = async (member_id: string, data: User) => {
  updateDoc(UserDetail(member_id), data)
}

export const updatePayCount = async (member_id: string, count: number) => {
  updateDoc(UserDetail(member_id), { count: count })
}
