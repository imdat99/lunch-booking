import { INoti } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {  DocumentSnapshot} from 'firebase/firestore'
import { getListNotiByPage ,setUserSeen } from '@app/libs/api/noti'
import { AnyAction } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { updateFailed } from '../user'
export const namespace = 'LIST_NOTI'

interface NotiState {
  listNoti: INoti[] 
  lastSnapShot : DocumentSnapshot<INoti> | null
  isLastPage : boolean 
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
}

const initialState: NotiState = {
  listNoti : [] ,
  lastSnapShot : null,
  isLastPage : true,
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
    initializeSucceeded(state, action: PayloadAction<Omit<NotiState,"status">>) {
      state.listNoti = [...state.listNoti,...action.payload.listNoti]
      state.lastSnapShot = action.payload.lastSnapShot
      state.isLastPage = action.payload.isLastPage
      state.status = 'idle'
    },
    initializeFailed(state) {
      state.status = 'idle'
    },
    update(state) {
      state.status = 'loading'
    },
    updateSucceeded(state, action: PayloadAction<Omit<NotiState,"status">>) {
      state.listNoti = [...state.listNoti,...action.payload.listNoti]
      state.lastSnapShot = action.payload.lastSnapShot
      state.isLastPage = action.payload.isLastPage
      state.status = 'idle'
    },
    updateFailed(state) {
      state.status = 'failed'
    },
    setReadNoti(state,action : PayloadAction<Pick<NotiState,"listNoti">>){
      state.listNoti = action.payload.listNoti
    },
    addNewNotiCome(state,action : PayloadAction<INoti>){
      state.listNoti = [action.payload,...state.listNoti]
    }
  },
})

//Actions
export const { initialize , initializeSucceeded,initializeFailed,idle, update , updateSucceeded , setReadNoti , addNewNotiCome}= slice.actions

//Thunk
export function updateNoti(uid:string) : ThunkAction<void, RootState, unknown, AnyAction> {
  return async(dispatch,getState)=>{
    try {
      dispatch(update())
      const notiState = getState().LIST_NOTI
      const result = await getListNotiByPage(uid,notiState.lastSnapShot)
      dispatch(updateSucceeded(result!))
    } catch (error) {
      dispatch(updateFailed())
    }
  }

}

export  function initializeNotiList(uid:string) : ThunkAction<void, RootState, unknown, AnyAction>{
  return async (dispatch,getState)=>{
    try {
      dispatch(initialize())
        const result =  await getListNotiByPage(uid,null)
        dispatch(initializeSucceeded(result!))
    } catch (error) {
      dispatch(initializeFailed())
    }
  }
}

export  function setUserReadNoti(uid:string , noti: INoti) : ThunkAction<void, RootState, unknown, AnyAction>{
  return async (dispatch,getState)=>{
    try {
      if (!noti.userSeen?.includes(uid)) {
        await setUserSeen(uid,noti)
        const listNoti = getState().LIST_NOTI.listNoti
        const listNotiTemp = listNoti.map((currentNoti)=>{
          if(currentNoti.id === noti.id){
            return {...currentNoti,userSeen : [...currentNoti.userSeen,uid]}
          }
          return {...currentNoti}
        })
        dispatch(setReadNoti({listNoti :listNotiTemp}))
      }
    } catch (error) {
    }
  }
}

//selector
export const listNotiSelector = (state: RootState) => state[namespace].listNoti
export const notiStatusSelector = (state: RootState) => state[namespace].status
export const isLastPageSelector = (state: RootState) => state[namespace].isLastPage

export const reducer = slice.reducer
