import { collection, CollectionReference, doc, DocumentData, DocumentReference } from 'firebase/firestore'

import { db } from './firebase'
import { IAllowedEmail, IEvent, IEventDetail, ILastTimeCheckNoti, INoti, User, UserGroup } from './firebaseType'

const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>
}
const createDocumentReference = <T = DocumentData>(collectionName: string, id: string) => {
  return doc(db, collectionName, id) as DocumentReference<T>
}

// export all your collections
export const usersColection = createCollection<User>('Users')
export const EventColection = createCollection<IEvent>('Events')
export const NotiColection = createCollection<INoti>('Notification')
export const EventDetailColection = createCollection<IEventDetail>('EventDetail')
export const LastTimeCheckNotiColection = createCollection<ILastTimeCheckNoti>('LastTimeCheckNoti')
export const AllowedEmail = createDocumentReference<IAllowedEmail>('allowedEmail', 'email')
export const UserGroupCollection = createCollection<UserGroup>('userGroup')
export const EventDetail = (id: string) => createDocumentReference<IEventDetail>('EventDetail', id)
export const EventRef = (id: string) => createDocumentReference<IEvent>('Events', id)
export const UserDetail = (id: string) => createDocumentReference<User>('Users', id)
export const NotiDetail = (id: string) => createDocumentReference<INoti>('Notification', id)
export const LastTimeCheckNotiDetail = (id: string) => createDocumentReference<ILastTimeCheckNoti>('LastTimeCheckNoti', id)
