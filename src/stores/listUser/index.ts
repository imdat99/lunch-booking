import { User } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export const namespace = 'LIST_USER'
const initialState: User[] = []

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setListUser: (state, action: PayloadAction<User[]>) => action.payload,
    clearListUser: () => initialState,
  },
})

export const { setListUser, clearListUser } = slice.actions
export const listUserStore = (state: RootState) => state[namespace]
export const reducer = slice.reducer
