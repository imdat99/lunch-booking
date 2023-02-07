import { auth, storage } from '@app/server/firebase'
import { User, UserGroup } from '@app/server/firebaseType'
// import {User} from 'firebase/auth'
import { AllowedEmail, GroupDetail, UserDetail, UserGroupCollection, usersColection } from '@app/server/useDB'
import { store } from '@app/stores'
import { clearUser } from '@app/stores/user'
import dayjs from 'dayjs'
import { getAuth, signOut } from 'firebase/auth'
import { addDoc, doc, getDoc, getDocs, query, QuerySnapshot, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

export function getCurrentUser() {
  const auth = getAuth()

  return auth.currentUser
}

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

function toUserGroupData(snapshot: QuerySnapshot<UserGroup>): UserGroup[] {
  return snapshot.docs.map((d) => ({
    ...d.data(),
    groupId: d.id,
  }))
}

/**
 * Gets all user-group that contains `uid` in `members`
 * @param uid firebase userId
 * @returns
 */
export async function getUserGroupsByUserId(uid: string) {
  try {
    const q = query(UserGroupCollection, where('members', 'array-contains', uid))

    const docs = await getDocs(q)

    return toUserGroupData(docs)
  } catch (error) {
    console.log('🚀 ~ file: userAPI.ts:115 ~ getUserGroupByUserId ~ error', error)

    return []
  }
}

/**
 * Gets group by groupID
 * @param uid firebase userId
 * @returns
 */
export const getGroupById = async (groupId: string): Promise<UserGroup | undefined> => {
  try {
    const res = await getDoc(GroupDetail(groupId))
    return { ...res.data()!, groupId: res.id }
  } catch (error) {
    console.log('🚀 ~ file: userAPI.ts:115 ~ getUserGroupByUserId ~ error', error)
    return undefined
  }
}

/**
 * Get all user-group that contains `user`
 * @param user User
 * @returns
 */
export async function getUserGroupsByUser(user: User) {
  if (!user.uid) {
    return []
  }

  return getUserGroupsByUserId(user.uid)
}

export async function createGroup(GroupData: UserGroup) {
  try {
    let isSuccess = false
    console.log('GroupData.groupId', GroupData)
    if (GroupData.groupId !== '') {
      await updateDoc(GroupDetail(GroupData.groupId), GroupData).then(() => {
        isSuccess = true
      })
    } else {
      await addDoc(UserGroupCollection, GroupData).then((docRef) => {
        isSuccess = true
        GroupData.groupId = docRef.id
      })
    }
    return { isSuccess, GroupData }
  } catch (error) {
    console.log('ERROR SETTING USER INFO IN DB', error)
  }
}

export async function getMyUserGroups() {
  const user = getCurrentUser()

  if (!user) {
    return []
  }

  return getUserGroupsByUser(user)
}

export async function getAllUserGroup() {
  try {
    const groupDocs = await getDocs(UserGroupCollection)

    return toUserGroupData(groupDocs)
  } catch (error) {
    console.log('ERROR GETTING USER INFO IN DB', error)
  }
}
