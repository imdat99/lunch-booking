import { auth, storage } from '@app/server/firebase'
import { User, UserGroup } from '@app/server/firebaseType'
// import {User} from 'firebase/auth'
import { AllowedEmail, UserDetail, UserGroupCollection, usersColection } from '@app/server/useDB'
import { store } from '@app/stores'
import { clearUser } from '@app/stores/user'
import { signOut } from 'firebase/auth'
import { doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
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
  const imgRef = ref(storage, `images/qr/${dayjs(Date.now()).unix() + obj.name}`)
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

export const hadleLogout = async () => {
  try {
    await signOut(auth).then(() => {
      store.dispatch(clearUser())
    })
  } catch (error) {
    console.log('ERROR LOGGING OUT', error)
  }
}

export const getAllowedEmail = async (email: string) => {
  const allowedEmail = await getDoc(AllowedEmail)
  return allowedEmail.data()?.email.includes(email)
}

export async function getUserGroup() {
  try {
    const userDocs = await getDocs(UserGroupCollection)
    const listUser: UserGroup[] = []
    userDocs.docs.forEach((userDoc) => {
      const user = { ...userDoc.data(), groupId: userDoc.id }
      listUser.push(user)
    })
    return listUser
  } catch (error) {
    console.log('ERROR GETTING USER INFO IN DB', error)
  }
}
