import { getEventByPage } from '@app/libs/api/event'
import { IEvent, IEventDetail } from '@app/server/firebaseType'
import { RootState } from '@app/stores'
import { AnyAction, createSlice, PayloadAction, ThunkAction } from '@reduxjs/toolkit'
import { DocumentSnapshot } from 'firebase/firestore'
export const namespace = 'LIST_EVENT'
type StateType = {
  eventList: IEvent[]
  startPosition: number | 0
  isLastPage: boolean
}
const initialState: StateType = { eventList: [], startPosition: 0, isLastPage: false }

const slice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setListEvent: (state, action: PayloadAction<StateType>) => {
      state.eventList = action.payload.eventList
      state.startPosition = action.payload.startPosition
      state.isLastPage = action.payload.isLastPage
    },
    setListEventDetail: (state, action: PayloadAction<StateType>) => action.payload,
    clearListEvent: () => initialState,
  },
})

export const { setListEvent, clearListEvent } = slice.actions
export const listEventStore = (state: RootState) => state[namespace].eventList
export const isLastPageStore = (state: RootState) => state[namespace].isLastPage
export const reducer = slice.reducer
//Thunk
export function updateEventList(uid: string): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch, getState) => {
    try {
      const notiState = getState().LIST_EVENT
      const eventDetailState = getState().LIST_EVENT_DETAIL
      const result = await getEventByPage(uid, eventDetailState, notiState.startPosition)
      dispatch(setListEvent(result!))
    } catch (error) {
      console.log('err: ', error)
    }
  }
}

export function initializeEventList(uid: string): ThunkAction<void, RootState, unknown, AnyAction> {
  return async (dispatch, getState) => {
    try {
      const eventDetailState = getState().LIST_EVENT_DETAIL
      const result = await getEventByPage(uid, eventDetailState, 0)
      dispatch(setListEvent(result!))
    } catch (error) {
      console.log('err: ', error)
    }
  }
}
