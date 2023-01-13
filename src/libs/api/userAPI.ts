import { serverTimestamp, setDoc, getDoc, doc, updateDoc } from 'firebase/firestore'
// import {User} from 'firebase/auth'
import { usersColection, UserDetail } from '@app/server/useDB'
import { User } from '@app/server/firebaseType'
import { storage } from '@app/server/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { uniqueId } from 'lodash'
import dayjs from 'dayjs'

export async function createUser(userInfo: User) {
  try {
    await setDoc(
      doc(usersColection, userInfo?.uid as string),
      {
        ...userInfo,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.log('ERROR SETTING USER INFO IN DB', error)
  }
}

export async function getUserByUid(uid: string) {
  try {
    const res = await getDoc(UserDetail(uid))
    return res.data()
  } catch (error) {
    console.log('ERROR GETTING USER INFO IN DB', error)
  }
}

export async function updateUser(uid: string, userInfo: User) {
  try {
    await updateDoc(UserDetail(uid), userInfo)
  } catch (error) {
    console.log('ERROR UPDATE USER INFO FAILED', error)
  }
}

export async function uploadQRImg(obj: any) {
  const imgRef = ref(storage, `images/qr/${ dayjs(Date.now()).unix() + obj.name}`)
  try {
    await uploadBytes(imgRef, obj)
    return getDownloadURL(imgRef)
  } catch (error) {
    console.log('ERROR UPLOAD QR FAILED', error)
  }
}

export async function uploadAvatarImg(obj: any) {
  const imgRef = ref(storage, `images/avatar/${dayjs(Date.now()).unix() + obj.name}`)
  try {
    await uploadBytes(imgRef, obj)
    return getDownloadURL(imgRef)
  } catch (error) {
    console.log('ERROR UPLOAD QR FAILED', error)
  }
}
