import { IEvent } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export const namespace = 'LIST_EVENT'
const initialState: IEvent[] = []

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setListEvent: (state, action: PayloadAction<IEvent[]>) => action.payload,
    clearListEvent: () => initialState,
  },
})

export const { setListEvent, clearListEvent } = slice.actions
export const listEventStore = (state: RootState) => state[namespace]
export const reducer = slice.reducer
