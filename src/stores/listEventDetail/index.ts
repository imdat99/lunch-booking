import { IEventDetail } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export const namespace = 'LIST_EVENT_DETAIL'
const initialState: IEventDetail[] = []

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setListEventDetail: (state, action: PayloadAction<IEventDetail[]>) => action.payload,
    clearListEvent: () => initialState,
  },
})

export const { setListEventDetail, clearListEvent } = slice.actions
export const listEventDetailStore = (state: RootState) => state[namespace]
export const reducer = slice.reducer
