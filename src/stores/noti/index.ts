import { deleteDocNotiByUId, getCountNewNotice, getListNotiByPage, readAllNoti, setUserSeen } from '@app/libs/api/noti'
import { INoti } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DocumentSnapshot } from 'firebase/firestore'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'

import { updateFailed } from '../user'

export const namespace = 'LIST_NOTI'

interface NotiState {
  listNoti: INoti[]
  lastSnapShot: DocumentSnapshot<INoti> | null
  isLastPage: boolean
  newNotiNumber: number | undefined
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: NotiState = {
  listNoti: [],
  lastSnapShot: null,
  isLastPage: true,
  newNotiNumber: 0,
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
    initializeSucceeded(state, action: PayloadAction<Omit<NotiState, 'status'>>) {
      state.listNoti = [...state.listNoti, ...action.payload.listNoti]
      state.lastSnapShot = action.payload.lastSnapShot
      state.isLastPage = action.payload.isLastPage
      state.newNotiNumber = action.payload.newNotiNumber
      state.status = 'idle'
    },
    initializeFailed(state) {
      state.status = 'idle'
    },
    update(state) {
      state.status = 'loading'
    },
    updateSucceeded(state, action: PayloadAction<Omit<NotiState, 'status' | 'newNotiNumber'>>) {
      state.listNoti = [...state.listNoti, ...action.payload.listNoti]
      state.lastSnapShot = action.payload.lastSnapShot
      state.isLastPage = action.payload.isLastPage
      state.status = 'idle'
    },
    updateFailed(state) {
      state.status = 'failed'
    },
    setReadNoti(state, action: PayloadAction<Pick<NotiState, 'listNoti'>>) {
      state.listNoti = action.payload.listNoti
    },
    addNewNotiCome(state, action: PayloadAction<INoti>) {
      state.listNoti = [action.payload, ...state.listNoti]
    },
    updateNewNotiNumber(state, action: PayloadAction<number>) {
      state.newNotiNumber = action.payload
    },
    clearNotiList() {
      return initialState
    },
    setListNoti(state, action: PayloadAction<Pick<NotiState, 'listNoti'>>) {
      state.listNoti = action.payload.listNoti
    },
  },
})

//Actions
export const {
  initialize,
  initializeSucceeded,
  initializeFailed,
  idle,
  update,
  updateSucceeded,
  setReadNoti,
  addNewNotiCome,
  updateNewNotiNumber,
  clearNotiList,
  setListNoti,
} = slice.actions

//Thunk
export function updateNoti(uid: string): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch, getState) => {
    try {
      dispatch(update())
      const notiState = getState().LIST_NOTI
      const result = await getListNotiByPage(uid, notiState.lastSnapShot)
      dispatch(updateSucceeded(result!))
    } catch (error) {
      dispatch(updateFailed())
    }
  }
}

export function initializeNotiList(uid: string): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch) => {
    try {
      dispatch(initialize())
      const result = await getListNotiByPage(uid, null)
      const count = await getCountNewNotice(uid)
      dispatch(initializeSucceeded({ ...result!, newNotiNumber: count }))
    } catch (error) {
      dispatch(initializeFailed())
    }
  }
}

export function setUserReadNoti(uid: string, noti: INoti): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch, getState) => {
    try {
      if (!noti.userSeen?.includes(uid)) {
        await setUserSeen(uid, noti)
        const listNoti = getState().LIST_NOTI.listNoti
        const listNotiTemp = listNoti.map((currentNoti) => {
          if (currentNoti.id === noti.id) {
            return { ...currentNoti, userSeen: [...currentNoti.userSeen, uid] }
          }
          return { ...currentNoti }
        })

        // update store list noti read
        dispatch(setReadNoti({ listNoti: listNotiTemp }))

        // update store conut new noti
        const newNotiNumber = getState().LIST_NOTI.newNotiNumber
        dispatch(updateNewNotiNumber(newNotiNumber ? newNotiNumber - 1 : 0))
      }
    } catch (error) {
      console.log(error)
    }
  }
}

export function setReadAllNoti(uid: string): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch, getState) => {
    try {
      await readAllNoti(uid)
      const listNoti = getState().LIST_NOTI.listNoti
      const listNotiTemp = listNoti.map((currentNoti) => {
        return { ...currentNoti, userSeen: [...currentNoti.userSeen, uid] }
      })
      dispatch(setReadNoti({ listNoti: listNotiTemp }))
    } catch (error) {
      console.log(error)
    }
  }
}

export function updateNewNotiCount(uid: string): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch) => {
    try {
      const count = await getCountNewNotice(uid)
      dispatch(updateNewNotiNumber(count!))
    } catch (error) {
      console.log(error)
    }
  }
}

export function removeNotiUser(uid: string, noti: INoti): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch, getState) => {
    try {
      const newNoti = { ...noti, toUids: noti.toUids.filter((e) => e !== uid) }
      await deleteDocNotiByUId({ ...newNoti })

      // reload page
      const listNoti = getState().LIST_NOTI.listNoti
      const listNotiTemp = listNoti.filter((e) => e.id !== noti.id)

      // update store list noti
      dispatch(setListNoti({ listNoti: listNotiTemp }))

      // update store conut new noti
      const newNotiNumber = getState().LIST_NOTI.newNotiNumber
      dispatch(updateNewNotiNumber(newNotiNumber ? newNotiNumber - 1 : 0))
    } catch (error) {
      console.log(error)
    }
  }
}

//selector
export const listNotiSelector = (state: RootState) => state[namespace].listNoti
export const notiStatusSelector = (state: RootState) => state[namespace].status
export const isLastPageSelector = (state: RootState) => state[namespace].isLastPage

export const newNotiNumberSelector = (state: RootState) => state[namespace].newNotiNumber
export const reducer = slice.reducer
