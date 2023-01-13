import { createUser, getUserByUid, updateUser, uploadQRImg , uploadAvatarImg} from '@app/libs/api/userAPI'
import { User as UserType } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from 'firebase/auth'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'

export const namespace = 'USER'
interface userState {
  data: UserType
  status: 'idle' | 'loading' | 'succeeded' | 'failed' | 'updating'
}
const initialState: userState = {
  data: { uid: '' },
  status: 'idle',
}

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    idle(state) {
      state.status = 'idle'
    },
    initialize(state) {
      state.status = 'loading'
    },
    initializeSucceeded(state, action: PayloadAction<UserType>) {
      state.data = { ...action.payload }
      state.status = 'idle'
    },
    initializeFailed(state) {
      state.status = 'idle'
    },
    update(state) {
      state.status = 'updating'
    },
    updateSucceeded(state, action: PayloadAction<UserType>) {
      state.data = { ...action.payload }
      state.status = 'succeeded'
    },
    updateFailed(state) {
      state.status = 'failed'
    },
    clearUser: () => initialState,
  },
})

//Actions
export const { clearUser, idle, initialize, initializeSucceeded, initializeFailed, update, updateSucceeded, updateFailed } = slice.actions

//Selector
export const userStore = (state: RootState) => state[namespace].data
export const userStatus = (state: RootState) => state[namespace].status

//Thunk
export function initializeUser(authUser: User): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch) => {
    const { uid, displayName, email, photoURL } = authUser
    dispatch(initialize())
    const user = await getUserByUid(uid)
    if (!user?.uid) {
      const userInfo: UserType = {
        uid,
        name: displayName || 'unknown',
        email: email || 'undefined',
        photoURL: photoURL || '',
        ldapAcc: '',
        bankAccount: '',
        bankAccountName: '',
        address: '',
        phone: '',
      }

      try {
        await createUser(userInfo)
        dispatch(initializeSucceeded(userInfo))
      } catch (error) {
        dispatch(initializeFailed())
        dispatch(idle())
      }
    } else {
      dispatch(
        initializeSucceeded({
          ...user,
        })
      )
    }
  }
}

export function updateUserInfo(uid: string, userInfo: UserType, imgObj: any , imgAvatarObj : any): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch) => {
    dispatch(update())
    try {
      if (imgObj) {
        const qrURL = await uploadQRImg(imgObj)
        userInfo.qrCodeURL = qrURL
      }
      if (imgAvatarObj) {
        const avatarURL = await uploadAvatarImg(imgAvatarObj)
        userInfo.photoURL = avatarURL
      }
      await updateUser(uid, userInfo)
      dispatch(updateSucceeded(userInfo))
    } catch (error) {
      dispatch(updateFailed())
    }
  }
}

export const reducer = slice.reducer
