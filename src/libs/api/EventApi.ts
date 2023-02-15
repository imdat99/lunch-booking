import { storage } from '@app/server/firebase'
import { IEvent, IEventDetail, User } from '@app/server/firebaseType'
import { EventColection, EventDetail, EventDetailColection, EventRef, UserDetail, usersColection } from '@app/server/useDB'
import dayjs from 'dayjs'
import { addDoc, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

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
  // let eventId = ''
  await setDoc(doc(EventDetailColection, data?.id as string), data, { merge: true }).then((docRef) => {
    isSuccess = true
    console.log(docRef)
  })
  return { isSuccess }
}

export const updateEventDetail = async (eventDetailId: string, data: IEventDetail) => {
  let isSuccess = false
  await updateDoc(EventDetail(eventDetailId), data).then(() => {
    isSuccess = true
  })
  return { isSuccess, eventDetailId }
}

export const deleteEventDetail = async (eventDetailId: string) => {
  let isSuccess = false
  await deleteDoc(EventDetail(eventDetailId)).then(() => {
    isSuccess = true
  })
  return isSuccess
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

export async function uploadEventImg(obj: any) {
  const imgRef = ref(storage, `images/event/${dayjs(Date.now()).unix() + obj.name}`)
  try {
    await uploadBytes(imgRef, obj)
    return getDownloadURL(imgRef)
  } catch (error) {
    console.log('ERROR UPLOAD Event IMG FAILED', error)
  }
}
