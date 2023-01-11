import { INoti } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export const namespace = 'LIST_NOTI'
const initialState: INoti[] = []

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setLisNoti: (state, action: PayloadAction<INoti[]>) => action.payload,
    clearListNoti: () => initialState,
  },
})

export const { setLisNoti, clearListNoti } = slice.actions
export const listNotiStore = (state: RootState) => state[namespace]
export const reducer = slice.reducer
